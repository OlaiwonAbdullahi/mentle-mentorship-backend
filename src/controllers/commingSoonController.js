const CommingSoon = require("../models/CommingSoon");

// Get all comming soon items
const getCommingSoons = async (req, res) => {
  try {
    const items = await CommingSoon.find({}).sort({ createdAt: -1 });

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single item
const getCommingSoon = async (req, res) => {
  try {
    const item = await CommingSoon.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create item
const createCommingSoon = async (req, res) => {
  try {
    const { title, subtitle } = req.body;

    const item = await CommingSoon.create({ title, subtitle });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update item
const updateCommingSoon = async (req, res) => {
  try {
    let item = await CommingSoon.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    item = await CommingSoon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete item
const deleteCommingSoon = async (req, res) => {
  try {
    const item = await CommingSoon.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    await item.deleteOne();

    res.json({ success: true, message: "Item removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCommingSoons,
  getCommingSoon,
  createCommingSoon,
  updateCommingSoon,
  deleteCommingSoon,
};
