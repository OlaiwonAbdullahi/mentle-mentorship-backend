const Course = require("../models/Course");
const Contact = require("../models/Contact");
const Payment = require("../models/Payment");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Total courses
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    // Total contact messages
    const totalMessages = await Contact.countDocuments();
    const unreadMessages = await Contact.countDocuments({ isRead: false });

    // Payment statistics
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({
      status: "success",
    });
    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const failedPayments = await Payment.countDocuments({ status: "failed" });

    // Calculate total revenue
    const revenueData = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get revenue by course
    const revenueByCourse = await Payment.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: "$course",
          totalRevenue: { $sum: "$amount" },
          enrollments: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      {
        $project: {
          courseTitle: "$courseDetails.title",
          totalRevenue: 1,
          enrollments: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "success",
          paidAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$paidAt" },
            month: { $month: "$paidAt" },
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        courses: {
          total: totalCourses,
          published: publishedCourses,
          unpublished: totalCourses - publishedCourses,
        },
        messages: {
          total: totalMessages,
          unread: unreadMessages,
          read: totalMessages - unreadMessages,
        },
        payments: {
          total: totalPayments,
          successful: successfulPayments,
          pending: pendingPayments,
          failed: failedPayments,
        },
        revenue: {
          total: totalRevenue,
          byCourse: revenueByCourse,
          monthly: monthlyRevenue,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private (Admin only)
const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Recent payments
    const recentPayments = await Payment.find()
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(limit);

    // Recent messages
    const recentMessages = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    // Recent courses
    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: {
        payments: recentPayments,
        messages: recentMessages,
        courses: recentCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities,
};
