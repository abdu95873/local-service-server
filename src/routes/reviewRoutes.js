import express from "express";
import {
  createReview,
  getProviderReviews,
  getServiceReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/provider/:providerId", getProviderReviews);
router.get("/service/:serviceId", getServiceReviews);

export default router;
