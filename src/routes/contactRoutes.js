const express = require("express");
const router = express.Router();
const {
  submitContact,
  getMessages,
  getMessage,
  toggleReadStatus,
  deleteMessage,
} = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");
const { contactValidator, mongoIdValidator } = require("../utils/validators");

// Public route

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact form management
 */

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Submit a contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post("/", contactValidator, submitContact);

// Protected routes (Admin only)

/**
 * @swagger
 * /contact/messages:
 *   get:
 *     summary: Get all contact messages
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get("/messages", protect, getMessages);

/**
 * @swagger
 * /contact/messages/{id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [Contact]
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
router.get("/messages/:id", protect, mongoIdValidator, getMessage);

/**
 * @swagger
 * /contact/messages/{id}/read:
 *   patch:
 *     summary: Toggle message read status
 *     tags: [Contact]
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
router.patch("/messages/:id/read", protect, mongoIdValidator, toggleReadStatus);

/**
 * @swagger
 * /contact/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Contact]
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
router.delete("/messages/:id", protect, mongoIdValidator, deleteMessage);

module.exports = router;
