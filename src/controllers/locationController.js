import Location from "../models/Location.js";

export const createLocation = async (req, res) => {
  try {
    const loc = await Location.create(req.body);
    res.status(201).json({ success: true, location: loc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ division: 1, district: 1 });
    res.json({ success: true, locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const districts = await Location.distinct("district");
    res.json({ success: true, districts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getThanas = async (req, res) => {
  try {
    const { district } = req.query;
    const filter = district ? { district } : {};
    const thanas = await Location.distinct("upazila", filter);
    res.json({ success: true, thanas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Location deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
