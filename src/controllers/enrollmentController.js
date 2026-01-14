const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const createEnrollment = async (req, res) => {
  try {
    const {
      courseId,
      fullName,
      email,
      phone,
      location,
      educationLevel,
      linkedInProfile,
      serviceOffering,
      motivation,
      expectedOutcomes,
      challenges,
      successMeasurement,
      furtherQuestions,
      willingToAttendNext,
      feeCommitment,
      paymentMethod,
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const enrollmentData = {
      course: courseId,
      fullName,
      email,
      phone,
      location,
      educationLevel,
      linkedInProfile,
      serviceOffering,
      motivation,
      expectedOutcomes,
      challenges,
      successMeasurement,
      furtherQuestions,
      willingToAttendNext:
        willingToAttendNext === "true" || willingToAttendNext === true,
      paymentMethod,
      status: "pending",
    };

    // European-specific validation
    if (location === "Europe") {
      if (!feeCommitment || feeCommitment === "false") {
        return res.status(400).json({
          success: false,
          message:
            "Fee commitment confirmation is required for European applicants",
        });
      }
      enrollmentData.feeCommitment = true;

      if (paymentMethod === "manual") {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Receipt upload is required for manual payments",
          });
        }
        enrollmentData.receiptUrl = req.file.path; // Cloudinary URL
      }
    }

    const enrollment = await Enrollment.create(enrollmentData);

    res.status(201).json({
      success: true,
      message:
        location === "Africa"
          ? "Application submitted. Please proceed to payment."
          : "Application and receipt submitted successfully. Admin will review.",
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("course", "title price_in_ngn price_in_euro")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // If status is being updated to 'paid', increment the course enrollment count
    if (status === "paid") {
      await Course.findByIdAndUpdate(enrollment.course, {
        $inc: { enrollmentCount: 1 },
      });
      // Also set paidAt if not already set
      enrollment.paidAt = new Date();
      await enrollment.save();
    }

    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createEnrollment,
  getEnrollments,
  updateEnrollmentStatus,
};
