const express = require("express");
const router = express.Router();
const {
  submitWaitlist,
  getWaitlist,
  getWaitlistItem,
  toggleReadStatus,
  deleteWaitlistItem,
} = require("../controllers/waitlist");
const { protect } = require("../middleware/authMiddleware");
const { contactValidator, mongoIdValidator } = require("../utils/validators");

// Public route

/**
 * @swagger
 * tags:
 *   name: Waitlist
 *   description: Waitlist management
 */

/**
 * @swagger
 * /waitlist:
 *   post:
 *     summary: Submit a waitlist form
 *     tags: [Waitlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post("/", contactValidator, submitWaitlist);

// Protected routes (Admin only)

/**
 * @swagger
 * /waitlist:
 *   get:
 *     summary: Get all waitlist messages
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get("/", protect, getWaitlist);

/**
 * @swagger
 * /waitlist/{id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Message content
 */
router.get("/:id", protect, mongoIdValidator, getWaitlistItem);

/**
 * @swagger
 * /waitlist/{id}/read:
 *   patch:
 *     summary: Toggle message read status
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/read", protect, mongoIdValidator, toggleReadStatus);

/**
 * @swagger
 * /waitlist/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete("/:id", protect, mongoIdValidator, deleteWaitlistItem);

module.exports = router;
