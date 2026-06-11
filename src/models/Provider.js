import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    nid: { type: String, required: true },
    bio: { type: String, default: "" },
    category: { type: String, required: true }, // e.g. "Plumber"
    services: { type: [String], default: [] },  // e.g. ["pipe fix", "leak repair"]

    location: {
      division: { type: String, default: "Dhaka" },
      district: { type: String, required: true },
      upazila: { type: String, required: true },
      area: { type: String, required: true },
      address: { type: String, default: null },
    },

    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },

    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // Application status (admin review)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Provider", providerSchema);
