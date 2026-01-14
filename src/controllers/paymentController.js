const Payment = require("../models/Payment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { initializePayment, verifyPayment } = require("../utils/paystack");
const crypto = require("crypto");

//  Initiate payment for a course
const initiatePaymentForCourse = async (req, res) => {
  try {
    const { courseId, customerName, customerEmail, customerPhone } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const reference = `MNTLE-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;
    const payment = await Payment.create({
      course: courseId,
      customerName,
      customerEmail,
      customerPhone,
      amount: course.price_in_ngn,
      currency: "NGN",
      reference,
      status: "pending",
    });

    // Update enrollment with paystack reference
    const enrollment = await Enrollment.findOne({
      email: customerEmail,
      course: courseId,
      status: "pending",
    });
    if (enrollment) {
      enrollment.paystackReference = reference;
      await enrollment.save();
    }

    // Initialize payment with Paystack
    const paystackResponse = await initializePayment(
      customerEmail,
      course.price_in_ngn,
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

// Verify payment
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

    // If already verified
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
      const enrollment = await Enrollment.findOne({
        paystackReference: reference,
      });

      if (enrollment) {
        enrollment.status = "paid";
        enrollment.paidAt = new Date();
        await enrollment.save();

        await Course.findByIdAndUpdate(enrollment.course, {
          $inc: { enrollmentCount: 1 },
        });

        res.json({
          success: true,
          message: "Payment verified and enrollment completed successfully",
          data: enrollment,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Enrollment record not found for this reference",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  Get payment by transaction ID
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

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const { status, courseId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (courseId) filter.course = courseId;

    const payments = await Payment.find(filter)
      .populate("course", "title price")
      .sort({ createdAt: -1 });

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

// Paystack webhook handler
const handleWebhook = async (req, res) => {
  try {
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

      // Update payment record
      const payment = await Payment.findOne({ reference });
      if (payment && payment.status !== "success") {
        payment.status = "success";
        payment.paidAt = new Date();
        payment.paymentMethod = event.data.channel;
        await payment.save();
      } else if (!payment) {
        console.error(
          `[Webhook] Payment not found for reference: ${reference}`
        );
      }

      // Find and update enrollment
      const enrollment = await Enrollment.findOne({
        paystackReference: reference,
      });
      if (enrollment && enrollment.status !== "paid") {
        enrollment.status = "paid";
        enrollment.paidAt = new Date();
        await enrollment.save();

        // Increment enrollment count
        await Course.findByIdAndUpdate(enrollment.course, {
          $inc: { enrollmentCount: 1 },
        });

        console.log(
          `[Webhook] Successfully processed payment for enrollment: ${enrollment._id}`
        );
      } else if (!enrollment) {
        console.error(
          `[Webhook] Enrollment not found for reference: ${reference}`
        );
        console.error(
          `[Webhook] Event data:`,
          JSON.stringify(event.data, null, 2)
        );
      } else {
        console.log(
          `[Webhook] Enrollment ${enrollment._id} already marked as paid`
        );
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
