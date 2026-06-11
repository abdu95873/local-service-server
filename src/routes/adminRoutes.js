import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  changeUserRole,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin")); // all admin routes protected

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", toggleUserStatus);
router.patch("/users/:id/role", changeUserRole);

export default router;
