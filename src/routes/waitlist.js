const express = require("express");
const router = express.Router();
const { submitWaitlist, getWaitlist } = require("../controllers/waitlist");
const { protect } = require("../middleware/authMiddleware");
const { waitlistValidator } = require("../utils/validators");

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
router.post("/", waitlistValidator, submitWaitlist);

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

module.exports = router;
