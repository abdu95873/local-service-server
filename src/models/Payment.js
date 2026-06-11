import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },

    method: {
      type: String,
      enum: ["cash", "bkash", "online"],
      required: true,
    },

    // bKash specific
    bkashPaymentID: { type: String, default: null },
    bkashTrxID: { type: String, default: null },
    bkashExecuteTime: { type: Date, default: null },
    bkashCustomerMsisdn: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    // For cash payment — confirmed by provider
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
