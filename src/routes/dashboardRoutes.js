const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getRecentActivities,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// All dashboard routes are protected (Admin only)

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/stats", protect, getDashboardStats);

/**
 * @swagger
 * /dashboard/recent-activities:
 *   get:
 *     summary: Get recent activities
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activities list
 */
router.get("/recent-activities", protect, getRecentActivities);

module.exports = router;
