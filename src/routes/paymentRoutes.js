import express from "express";
import {
  initiateBkashPayment,
  executeBkashPayment,
  confirmCashPayment,
  getPaymentByBooking,
  getAllPayments,
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// bKash
router.post("/bkash/initiate", protect, initiateBkashPayment);
router.post("/bkash/execute", protect, executeBkashPayment);

// Cash
router.post("/cash/confirm", protect, authorize("provider", "admin"), confirmCashPayment);

// Info
router.get("/booking/:bookingId", protect, getPaymentByBooking);
router.get("/all", protect, authorize("admin"), getAllPayments);

export default router;
