import express from "express";
import {
  createLocation,
  getAllLocations,
  getDistricts,
  getThanas,
  deleteLocation,
} from "../controllers/locationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllLocations);
router.get("/districts", getDistricts);
router.get("/thanas", getThanas);
router.post("/", protect, authorize("admin"), createLocation);
router.delete("/:id", protect, authorize("admin"), deleteLocation);

export default router;
