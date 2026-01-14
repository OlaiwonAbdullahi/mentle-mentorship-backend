const Course = require("../models/Course");
const Contact = require("../models/Contact");
const Payment = require("../models/Payment");
const Enrollment = require("../models/Enrollment");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Total courses
    const totalCourses = await Course.countDocuments();
    // Total contact messages
    const totalMessages = await Contact.countDocuments();
    const unreadMessages = await Contact.countDocuments({ isRead: false });

    // Payment statistics (Paystack specific)
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({
      status: "success",
    });
    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const failedPayments = await Payment.countDocuments({ status: "failed" });

    // Enrollment statistics (General)
    const totalEnrollments = await Enrollment.countDocuments();
    const paidEnrollments = await Enrollment.countDocuments({ status: "paid" });
    const pendingEnrollments = await Enrollment.countDocuments({
      status: "pending",
    });

    // Calculate total revenue from Paystack (NGN)
    const paystackRevenueData = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const paystackRevenue =
      paystackRevenueData.length > 0 ? paystackRevenueData[0].total : 0;

    // Calculate manual revenue from European enrollments (EUR)
    const manualEnrollments = await Enrollment.find({
      paymentMethod: "manual",
      status: "paid",
    }).populate("course", "price_in_euro");

    const manualRevenue = manualEnrollments.reduce((sum, enr) => {
      return sum + (enr.course?.price_in_euro || 0);
    }, 0);

    // Get revenue by course (combined)
    // 1. Paystack revenue by course
    const paystackByCourse = await Payment.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: "$course",
          revenueNGN: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // 2. Manual revenue by course
    const manualByCourseData = await Enrollment.aggregate([
      { $match: { paymentMethod: "manual", status: "paid" } },
      {
        $group: {
          _id: "$course",
          count: { $sum: 1 },
        },
      },
    ]);

    // Combine them
    const coursesFull = await Course.find(
      {},
      "title price_in_ngn price_in_euro"
    );
    const revenueByCourse = coursesFull
      .map((course) => {
        const pData = paystackByCourse.find(
          (p) => p._id.toString() === course._id.toString()
        );
        const mData = manualByCourseData.find(
          (m) => m._id.toString() === course._id.toString()
        );

        return {
          courseId: course._id,
          courseTitle: course.title,
          revenueNGN: pData ? pData.revenueNGN : 0,
          revenueEUR: mData ? mData.count * course.price_in_euro : 0,
          totalEnrollments:
            (pData ? pData.count : 0) + (mData ? mData.count : 0),
        };
      })
      .filter((r) => r.totalEnrollments > 0);

    res.json({
      success: true,
      data: {
        courses: {
          total: totalCourses,
        },
        messages: {
          total: totalMessages,
          unread: unreadMessages,
          read: totalMessages - unreadMessages,
        },
        enrollments: {
          total: totalEnrollments,
          paid: paidEnrollments,
          pending: pendingEnrollments,
        },
        payments: {
          total: totalPayments,
          successful: successfulPayments,
          pending: pendingPayments,
          failed: failedPayments,
        },
        revenue: {
          totalNGN: paystackRevenue,
          totalEUR: manualRevenue,
          byCourse: revenueByCourse,
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

    // Recent enrollments (Both Africa and Europe)
    const recentEnrollments = await Enrollment.find()
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(limit);

    // Recent payments (Africa/Paystack only)
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
        enrollments: recentEnrollments,
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
