const express = require("express");
const router = express.Router();
const {
  initiatePaymentForCourse,
  verifyPaymentTransaction,
  getPaymentByTransaction,
  getAllPayments,
  handleWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { initiatePaymentValidator } = require("../utils/validators");

// Public routes

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing
 */

/**
 * @swagger
 * /payments/initiate:
 *   post:
 *     summary: Initiate a payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - amount
 *             properties:
 *               email:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment initiated
 */
router.post("/initiate", initiatePaymentValidator, initiatePaymentForCourse);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify a payment
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post("/verify", verifyPaymentTransaction);

/**
 * @swagger
 * /payments/{transactionId}:
 *   get:
 *     summary: Get payment by transaction ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get("/:transactionId", getPaymentByTransaction);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Payment webhook handler
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post("/webhook", handleWebhook);

// Protected routes (Admin only)

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments (Admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get("/", protect, getAllPayments);

module.exports = router;
