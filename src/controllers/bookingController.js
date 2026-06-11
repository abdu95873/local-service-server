import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import { sendBookingConfirmationEmail } from "../utils/email.js";
import User from "../models/User.js";

// ─── CREATE BOOKING ───────────────────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const { serviceId, providerId, address, scheduledDate, notes, paymentMethod } = req.body;

    if (!serviceId || !address || !scheduledDate)
      return res.status(400).json({ success: false, message: "serviceId, address, scheduledDate required" });

    const service = await Service.findById(serviceId);
    if (!service)
      return res.status(404).json({ success: false, message: "Service not found" });

    if (!service.isActive)
      return res.status(400).json({ success: false, message: "Service is not available" });

    const booking = await Booking.create({
      user: req.user.id,
      provider: providerId || null,
      service: serviceId,
      address,
      scheduledDate,
      notes,
      price: service.price,
      paymentMethod: paymentMethod || "cash",
    });

    await booking.populate([
      { path: "service", select: "title price" },
      { path: "user", select: "name email" },
    ]);

    // Send confirmation email
    try {
      const user = await User.findById(req.user.id);
      if (user?.email) {
        await sendBookingConfirmationEmail(user.email, {
          service: service.title,
          date: new Date(scheduledDate).toLocaleDateString("bn-BD"),
          address,
          price: service.price,
          paymentMethod: paymentMethod || "cash",
        });
      }
    } catch (emailErr) {
      console.error("Email send failed (non-critical):", emailErr.message);
    }

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY BOOKINGS (user) ───────────────────────────────────
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("service", "title price image")
      .populate({ path: "provider", populate: { path: "userId", select: "name photo phone" } })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET PROVIDER'S BOOKINGS ──────────────────────────────────
export const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.params.providerId })
      .populate("service", "title price image")
      .populate("user", "name photo phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL BOOKINGS (admin) ─────────────────────────────────
export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const bookings = await Booking.find(filter)
      .populate("service", "title price")
      .populate("user", "name email phone")
      .populate({ path: "provider", populate: { path: "userId", select: "name" } })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SINGLE BOOKING ───────────────────────────────────────
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("service")
      .populate("user", "name email phone photo")
      .populate({ path: "provider", populate: { path: "userId", select: "name photo phone" } })
      .populate("payment");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    // Only owner, provider or admin can view
    const isOwner = booking.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: "Access denied" });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE BOOKING STATUS ────────────────────────────────────
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const allowed = ["pending", "accepted", "in_progress", "completed", "cancelled"];

    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const update = { status };
    if (status === "cancelled" && cancelReason) update.cancelReason = cancelReason;

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
