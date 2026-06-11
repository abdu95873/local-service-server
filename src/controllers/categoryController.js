import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const cat = await Category.create({ name, icon });
    res.status(201).json({ success: true, category: cat });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: "Category already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, category: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
