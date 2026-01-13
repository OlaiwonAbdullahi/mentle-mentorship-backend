const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");


// POST /api/auth/register
//(should be disabled after first admin creation)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if any admin exists
    const anyAdminExists = await Admin.countDocuments();
    if (anyAdminExists > 0) {
      return res.status(400).json({
        success: false,
        message: "Admin registration is restricted. An admin already exists.",
      });
    }

    // Check if this specific email exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    if (admin) {
      res.status(201).json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid admin data",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// POST /api/auth/login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin email
    const admin = await Admin.findOne({ email }).select("+password");

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current admin profile
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// admin logout logic
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getMe,
  logout,
};
