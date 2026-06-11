import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    division: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    upazila: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Location", locationSchema);
