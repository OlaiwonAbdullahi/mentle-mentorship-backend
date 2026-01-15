const express = require("express");
const router = express.Router();
const {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getCourseSchedules,
} = require("../controllers/scheduleController");
const { protect } = require("../middleware/authMiddleware");
const {
  createScheduleValidator,
  updateScheduleValidator,
  mongoIdValidator,
} = require("../utils/validators");

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Schedule management for courses
 */

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules (public)
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter schedules by course ID
 *     responses:
 *       200:
 *         description: List of schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/", getSchedules);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Get a single schedule by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule details
 *       404:
 *         description: Schedule not found
 */
router.get("/:id", mongoIdValidator, getSchedule);

/**
 * @swagger
 * /schedules/courses/{courseId}:
 *   get:
 *     summary: Get all schedules for a specific course
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: List of course schedules
 *       404:
 *         description: Course not found
 */
router.get("/courses/:courseId", getCourseSchedules);

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a new schedule (Admin only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - title
 *               - description
 *               - week
 *               - facilitator
 *               - date
 *             properties:
 *               courseId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               week:
 *                 type: number
 *               facilitator:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.post("/", protect, createScheduleValidator, createSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Update a schedule (Admin only)
 *     tags: [Schedules]
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
 *             properties:
 *               courseId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               week:
 *                 type: number
 *               facilitator:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule not found
 */
router.put("/:id", protect, updateScheduleValidator, updateSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete a schedule (Admin only)
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule not found
 */
router.delete("/:id", protect, mongoIdValidator, deleteSchedule);

module.exports = router;
