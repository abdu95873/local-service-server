import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", default: null },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },

    // Booking details
    address: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    notes: { type: String, default: "" },

    // Pricing
    price: { type: Number, required: true },

    // Status flow: pending → accepted → in_progress → completed | cancelled
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    cancelReason: { type: String, default: null },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["cash", "bkash", "online"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
