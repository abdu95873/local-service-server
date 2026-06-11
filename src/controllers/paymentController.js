import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import axios from "axios";

const BKASH_BASE = process.env.BKASH_BASE_URL;

// ─── GET BKASH TOKEN ──────────────────────────────────────────
const getBkashToken = async () => {
  const res = await axios.post(
    `${BKASH_BASE}/tokenized/checkout/token/grant`,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    {
      headers: {
        "Content-Type": "application/json",
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
      },
    }
  );
  return res.data.id_token;
};

// ─── INITIATE BKASH PAYMENT ───────────────────────────────────
export const initiateBkashPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("service", "title");
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (booking.paymentStatus === "paid")
      return res.status(400).json({ success: false, message: "Already paid" });

    const token = await getBkashToken();

    const createRes = await axios.post(
      `${BKASH_BASE}/tokenized/checkout/create`,
      {
        mode: "0011",
        payerReference: req.user.id,
        callbackURL: `${process.env.CLIENT_URL}/payment/callback`,
        amount: booking.price.toString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: bookingId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": process.env.BKASH_APP_KEY,
        },
      }
    );

    const { bkashURL, paymentID, statusCode, statusMessage } = createRes.data;

    if (statusCode !== "0000")
      return res.status(400).json({ success: false, message: statusMessage });

    // Save pending payment
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount: booking.price,
      method: "bkash",
      bkashPaymentID: paymentID,
      status: "pending",
    });

    res.json({ success: true, bkashURL, paymentID, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── EXECUTE BKASH PAYMENT (callback) ────────────────────────
export const executeBkashPayment = async (req, res) => {
  try {
    const { paymentID, status } = req.body;

    if (status === "cancel" || status === "failure") {
      await Payment.findOneAndUpdate({ bkashPaymentID: paymentID }, { status: "failed" });
      return res.json({ success: false, message: "Payment cancelled or failed" });
    }

    const token = await getBkashToken();

    const executeRes = await axios.post(
      `${BKASH_BASE}/tokenized/checkout/execute`,
      { paymentID },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": process.env.BKASH_APP_KEY,
        },
      }
    );

    const { trxID, customerMsisdn, statusCode, statusMessage, merchantInvoiceNumber } =
      executeRes.data;

    if (statusCode !== "0000") {
      await Payment.findOneAndUpdate({ bkashPaymentID: paymentID }, { status: "failed" });
      return res.status(400).json({ success: false, message: statusMessage });
    }

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { bkashPaymentID: paymentID },
      {
        bkashTrxID: trxID,
        bkashCustomerMsisdn: customerMsisdn,
        bkashExecuteTime: new Date(),
        status: "completed",
      },
      { new: true }
    );

    // Update booking payment status
    await Booking.findByIdAndUpdate(merchantInvoiceNumber, {
      paymentStatus: "paid",
      payment: payment._id,
    });

    res.json({ success: true, trxID, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CASH PAYMENT CONFIRM (by provider/admin) ─────────────────
export const confirmCashPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.paymentMethod !== "cash")
      return res.status(400).json({ success: false, message: "This booking is not cash payment" });

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: booking.user,
      amount: booking.price,
      method: "cash",
      status: "completed",
      confirmedBy: req.user.id,
      confirmedAt: new Date(),
    });

    // Update booking
    booking.paymentStatus = "paid";
    booking.payment = payment._id;
    await booking.save();

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET PAYMENT INFO ─────────────────────────────────────────
export const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate("user", "name email")
      .populate("booking");

    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL PAYMENTS (admin) ─────────────────────────────────
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("booking")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
