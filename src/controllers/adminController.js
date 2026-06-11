import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Service from "../models/Service.js";

// ─── DASHBOARD STATS ──────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      pendingProviders,
      totalBookings,
      completedBookings,
      totalServices,
      totalRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Provider.countDocuments({ status: "approved" }),
      Provider.countDocuments({ status: "pending" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "completed" }),
      Service.countDocuments({ isActive: true }),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        pendingProviders,
        totalBookings,
        completedBookings,
        totalServices,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL USERS ────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter)
      .select("-password -resetOTP -resetOTPExpiry")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TOGGLE USER ACTIVE STATUS ────────────────────────────────
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CHANGE USER ROLE ─────────────────────────────────────────
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "provider", "admin"].includes(role))
      return res.status(400).json({ success: false, message: "Invalid role" });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
      "-password"
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
