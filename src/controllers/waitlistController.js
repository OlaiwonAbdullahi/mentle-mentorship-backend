const Waitlist = require("../models/Waitlist");

// @desc    Submit contact form
// @route   POST /api/waitlist
// @access  Public
const submitWaitlist = async (req, res) => {
  try {
    const { name, email } = req.body;

    const waitlist = await Waitlist.create({
      name,
      email,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully. We will get back to you soon!",
      data: waitlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/waitlist
// @access  Private (Admin only)
const getWaitlist = async (req, res) => {
  try {
    const waitlist = await Waitlist.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: waitlist.length,
      data: waitlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  submitWaitlist,
  getWaitlist,
};
