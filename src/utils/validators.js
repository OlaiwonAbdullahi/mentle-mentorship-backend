const { body, param, validationResult } = require("express-validator");

// Validation middleware to check results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Auth validators
const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// Course validators
const createCourseValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Course title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Course description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("duration").trim().notEmpty().withMessage("Duration is required"),
  validate,
];

const updateCourseValidator = [
  param("id").isMongoId().withMessage("Invalid course ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  validate,
];

// Contact validators
const contactValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters"),
  validate,
];

// Payment validators
const initiatePaymentValidator = [
  body("courseId").isMongoId().withMessage("Invalid course ID"),
  body("customerName")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required"),
  body("customerEmail")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("customerPhone").optional().trim(),
  validate,
];

// ID validators
const mongoIdValidator = [
  param("id").isMongoId().withMessage("Invalid ID"),
  validate,
];

// Waitlist validators
const waitlistValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  validate,
];

module.exports = {
  loginValidator,
  createCourseValidator,
  updateCourseValidator,
  contactValidator,
  waitlistValidator,
  initiatePaymentValidator,
  mongoIdValidator,
};
