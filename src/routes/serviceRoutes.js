import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  toggleServiceStatus,
  deleteService,
} from "../controllers/serviceController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);

router.post("/", protect, authorize("admin"), createService);
router.patch("/:id", protect, authorize("admin"), updateService);
router.patch("/:id/status", protect, authorize("admin"), toggleServiceStatus);
router.delete("/:id", protect, authorize("admin"), deleteService);

export default router;
