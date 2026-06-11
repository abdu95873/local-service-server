import Service from "../models/Service.js";

// ─── CREATE SERVICE ───────────────────────────────────────────
export const createService = async (req, res) => {
  try {
    const { title, description, price, image, category, provider } = req.body;

    if (!title || !description || !price || !image || !category)
      return res.status(400).json({ success: false, message: "All fields required" });

    const service = await Service.create({ title, description, price, image, category, provider });
    await service.populate("category");

    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL SERVICES (public, with filters) ──────────────────
export const getAllServices = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, isActive, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    else filter.isActive = true; // default: only active
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.title = { $regex: search, $options: "i" };

    const services = await Service.find(filter)
      .populate("category", "name icon")
      .populate("provider")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SINGLE SERVICE ───────────────────────────────────────
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("category", "name icon")
      .populate({ path: "provider", populate: { path: "userId", select: "name photo" } });

    if (!service)
      return res.status(404).json({ success: false, message: "Service not found" });

    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE SERVICE ───────────────────────────────────────────
export const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name icon");

    if (!service)
      return res.status(404).json({ success: false, message: "Service not found" });

    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TOGGLE SERVICE STATUS ────────────────────────────────────
export const toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service)
      return res.status(404).json({ success: false, message: "Service not found" });

    service.isActive = !service.isActive;
    await service.save();

    res.json({ success: true, isActive: service.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE SERVICE ───────────────────────────────────────────
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service)
      return res.status(404).json({ success: false, message: "Service not found" });

    res.json({ success: true, message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
