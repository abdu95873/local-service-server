import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import admin, { firebaseReady } from "../config/firebaseAdmin.js";
import { sendOTPEmail } from "../utils/email.js";

// ─── REGISTER ────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "name, email, password required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed });

    const token = generateToken({ id: user._id, role: user.role });
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({ success: true, token, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (!user.password)
      return res.status(400).json({ success: false, message: "Use Google login for this account" });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account is disabled" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ success: false, message: "Wrong password" });

    const token = generateToken({ id: user._id, role: user.role });
    const { password: _, ...userData } = user.toObject();

    res.json({ success: true, token, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── FIREBASE / GOOGLE LOGIN ─────────────────────────────────
export const firebaseLogin = async (req, res) => {
  try {
    if (!firebaseReady)
      return res.status(503).json({ success: false, message: "Firebase login is not configured on the server" });

    const { token } = req.body;
    if (!token)
      return res.status(400).json({ success: false, message: "Firebase token required" });

    const decoded = await admin.auth().verifyIdToken(token);
    const { email, name, picture } = decoded;

    if (!email)
      return res.status(400).json({ success: false, message: "No email from Firebase" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || "User",
        email,
        photo: picture || null,
        role: "user",
      });
    }

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account is disabled" });

    const appToken = generateToken({ id: user._id, role: user.role });
    const { password: _, ...userData } = user.toObject();

    res.json({ success: true, token: appToken, user: userData });
  } catch (err) {
    res.status(401).json({ success: false, message: "Firebase login failed: " + err.message });
  }
};

// ─── LOGOUT (client deletes token, server just confirms) ─────
export const logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

// ─── FORGOT PASSWORD — send OTP ──────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "No account with this email" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VERIFY OTP ───────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.resetOTP !== otp)
      return res.status(400).json({ success: false, message: "Wrong OTP" });

    if (user.resetOTPExpiry < new Date())
      return res.status(400).json({ success: false, message: "OTP expired" });

    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.resetOTP !== otp)
      return res.status(400).json({ success: false, message: "Wrong OTP" });

    if (user.resetOTPExpiry < new Date())
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY PROFILE ───────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -resetOTP -resetOTPExpiry")
      .populate("providerProfile");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE MY PROFILE ────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, photo } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, photo },
      { new: true, runValidators: true }
    ).select("-password -resetOTP -resetOTPExpiry");

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
