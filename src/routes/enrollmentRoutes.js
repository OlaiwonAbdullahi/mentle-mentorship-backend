const express = require("express");
const router = express.Router();
const {
    createEnrollment,
    getEnrollments,
    updateEnrollmentStatus,
} = require("../controllers/enrollmentController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Application form and enrollment management
 */

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Submit application form
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - fullName
 *               - email
 *               - phone
 *               - location
 *               - educationLevel
 *               - linkedInProfile
 *               - serviceOffering
 *               - motivation
 *               - expectedOutcomes
 *               - challenges
 *               - successMeasurement
 *               - paymentMethod
 *             properties:
 *               courseId:
 *                 type: string
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               location:
 *                 type: string
 *                 enum: [Africa, Europe]
 *               educationLevel:
 *                 type: string
 *                 enum: [SSCE, OND, HND, BSC, MSc, PhD, Others]
 *               linkedInProfile:
 *                 type: string
 *               serviceOffering:
 *                 type: string
 *               motivation:
 *                 type: string
 *               expectedOutcomes:
 *                 type: string
 *               challenges:
 *                 type: string
 *               successMeasurement:
 *                 type: string
 *               furtherQuestions:
 *                 type: string
 *               willingToAttendNext:
 *                 type: boolean
 *               feeCommitment:
 *                 type: boolean
 *               paymentMethod:
 *                 type: string
 *                 enum: [paystack, manual]
 *               receipt:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Course not found
 */
router.post("/", upload.single("receipt"), createEnrollment);

/**
 * @swagger
 * /enrollments:
 *   get:
 *     summary: Get all enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrollments
 *       401:
 *         description: Not authorized
 */
router.get("/", protect, getEnrollments);

/**
 * @swagger
 * /enrollments/{id}/status:
 *   patch:
 *     summary: Update enrollment status
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, failed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Enrollment not found
 *       401:
 *         description: Not authorized
 */
router.patch("/:id/status", protect, updateEnrollmentStatus);

module.exports = router;
