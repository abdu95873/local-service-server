import Provider from "../models/Provider.js";
import User from "../models/User.js";

// ─── APPLY AS PROVIDER ────────────────────────────────────────
export const applyAsProvider = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if already applied
    const existing = await Provider.findOne({ userId });
    if (existing)
      return res.status(400).json({ success: false, message: "Already applied as provider" });

    const { nid, bio, category, services, location, priceRange } = req.body;

    if (!nid || !category || !location?.district || !location?.upazila || !location?.area)
      return res.status(400).json({ success: false, message: "nid, category, location required" });

    const provider = await Provider.create({
      userId,
      nid,
      bio,
      category,
      services,
      location,
      priceRange,
    });

    // Update user role to provider
    await User.findByIdAndUpdate(userId, {
      role: "provider",
      providerProfile: provider._id,
    });

    res.status(201).json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY PROVIDER PROFILE ─────────────────────────────────
export const getMyProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id }).populate("userId", "name email photo phone");
    if (!provider)
      return res.status(404).json({ success: false, message: "Provider profile not found" });

    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE MY PROVIDER PROFILE ──────────────────────────────
export const updateMyProviderProfile = async (req, res) => {
  try {
    const { bio, services, location, priceRange, isAvailable } = req.body;

    const provider = await Provider.findOneAndUpdate(
      { userId: req.user.id },
      { bio, services, location, priceRange, isAvailable },
      { new: true, runValidators: true }
    );

    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });

    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL PROVIDERS (admin / public) ───────────────────────
export const getAllProviders = async (req, res) => {
  try {
    const { status, category, district, isAvailable } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (district) filter["location.district"] = district;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

    const providers = await Provider.find(filter)
      .populate("userId", "name email photo phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: providers.length, providers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SINGLE PROVIDER ─────────────────────────────────────
export const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate("userId", "name email photo phone");
    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });

    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: APPROVE / REJECT PROVIDER ────────────────────────
export const updateProviderStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ success: false, message: "status must be approved or rejected" });

    const update = { status };
    if (status === "approved") update.isVerified = true;
    if (status === "rejected") update.rejectionReason = rejectionReason || "No reason given";

    const provider = await Provider.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });

    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TOGGLE AVAILABILITY ─────────────────────────────────────
export const toggleAvailability = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });

    provider.isAvailable = !provider.isAvailable;
    await provider.save();

    res.json({ success: true, isAvailable: provider.isAvailable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
