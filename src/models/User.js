import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: null },
    password: { type: String, default: null },
    photo: { type: String, default: null },
    role: {
      type: String,
      enum: ["user", "provider", "admin"],
      default: "user",
    },
    providerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    // Password reset
    resetOTP: { type: String, default: null },
    resetOTPExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
