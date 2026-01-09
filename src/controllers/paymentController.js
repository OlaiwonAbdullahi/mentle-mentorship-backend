const Payment = require("../models/Payment");
const Course = require("../models/Course");
const { initializePayment, verifyPayment } = require("../utils/paystack");
const crypto = require("crypto");

// @desc    Initiate payment for a course
// @route   POST /api/payments/initiate
// @access  Public
const initiatePaymentForCourse = async (req, res) => {
  try {
    const { courseId, customerName, customerEmail, customerPhone } = req.body;

    // Check if course exists and is published
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "This course is not available for enrollment",
      });
    }

    // Generate unique reference
    const reference = `MNTLE-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    // Create payment record
    const payment = await Payment.create({
      course: courseId,
      customerName,
      customerEmail,
      customerPhone,
      amount: course.price,
      currency: course.currency,
      reference,
      status: "pending",
    });

    // Initialize payment with Paystack
    const paystackResponse = await initializePayment(
      customerEmail,
      course.price,
      reference,
      {
        courseId,
        courseName: course.title,
        customerName,
        paymentId: payment._id.toString(),
      }
    );

    // Update payment with Paystack reference
    payment.paystackReference = paystackResponse.data.reference;
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        paymentId: payment._id,
        reference: payment.reference,
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Public
const verifyPaymentTransaction = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required",
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ reference }).populate("course");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // If already verified, return success
    if (payment.status === "success") {
      return res.json({
        success: true,
        message: "Payment already verified",
        data: payment,
      });
    }

    // Verify with Paystack
    const paystackVerification = await verifyPayment(reference);

    if (paystackVerification.data.status === "success") {
      // Update payment record
      payment.status = "success";
      payment.paidAt = new Date();
      payment.paymentMethod = paystackVerification.data.channel;
      await payment.save();

      // Increment course enrollment count
      await Course.findByIdAndUpdate(payment.course._id, {
        $inc: { enrollmentCount: 1 },
      });

      res.json({
        success: true,
        message: "Payment verified successfully",
        data: payment,
      });
    } else {
      // Update payment status to failed
      payment.status = "failed";
      await payment.save();

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
        data: payment,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get payment by transaction ID
// @route   GET /api/payments/:transactionId
// @access  Public (guest can check their payment)
const getPaymentByTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({
      reference: transactionId,
    }).populate("course", "title description price");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin only)
const getAllPayments = async (req, res) => {
  try {
    const { status, courseId } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (courseId) filter.course = courseId;

    const payments = await Payment.find(filter)
      .populate("course", "title price")
      .sort({ createdAt: -1 });

    // Calculate total revenue
    const totalRevenue = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      count: payments.length,
      totalRevenue,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Paystack webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Paystack)
const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const event = req.body;

    // Handle successful payment
    if (event.event === "charge.success") {
      const { reference } = event.data;

      const payment = await Payment.findOne({ reference });

      if (payment && payment.status !== "success") {
        payment.status = "success";
        payment.paidAt = new Date();
        payment.paymentMethod = event.data.channel;
        await payment.save();

        // Increment enrollment count
        await Course.findByIdAndUpdate(payment.course, {
          $inc: { enrollmentCount: 1 },
        });
      }
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook error");
  }
};

module.exports = {
  initiatePaymentForCourse,
  verifyPaymentTransaction,
  getPaymentByTransaction,
  getAllPayments,
  handleWebhook,
};
