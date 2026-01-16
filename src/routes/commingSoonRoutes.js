const express = require("express");
const router = express.Router();
const {
  getCommingSoons,
  getCommingSoon,
  createCommingSoon,
  updateCommingSoon,
  deleteCommingSoon,
} = require("../controllers/commingSoonController");
const { protect } = require("../middleware/authMiddleware");
const { mongoIdValidator, validate } = require("../utils/validators");
const { body } = require("express-validator");

// Public: list and get
router.get("/", getCommingSoons);
router.get("/:id", mongoIdValidator, getCommingSoon);

// Protected (admin) routes
const createValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  validate,
];

const updateValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  validate,
];

router.post("/", protect, createValidator, createCommingSoon);
router.put(
  "/:id",
  protect,
  mongoIdValidator,
  updateValidator,
  updateCommingSoon
);
router.delete("/:id", protect, mongoIdValidator, deleteCommingSoon);

module.exports = router;
