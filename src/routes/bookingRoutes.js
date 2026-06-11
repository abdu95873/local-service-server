import express from "express";
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/provider/:providerId", protect, authorize("provider", "admin"), getProviderBookings);
router.get("/all", protect, authorize("admin"), getAllBookings);
router.get("/:id", protect, getBookingById);
router.patch("/:id/status", protect, updateBookingStatus);

export default router;
