import express from "express";
import {
  applyAsProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
  getAllProviders,
  getProviderById,
  updateProviderStatus,
  toggleAvailability,
} from "../controllers/providerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllProviders);
router.get("/:id", getProviderById);

// Provider (logged in)
router.post("/apply", protect, applyAsProvider);
router.get("/me/profile", protect, authorize("provider"), getMyProviderProfile);
router.patch("/me/profile", protect, authorize("provider"), updateMyProviderProfile);
router.patch("/me/availability", protect, authorize("provider"), toggleAvailability);

// Admin only
router.patch("/:id/status", protect, authorize("admin"), updateProviderStatus);

export default router;
