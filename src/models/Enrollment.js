const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    fullName: {
      type: String,
      required: [true, "Please add full name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add email"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please add phone number"],
    },
    location: {
      type: String,
      enum: ["Africa", "Europe"],
      required: [true, "Please specify location"],
    },
    educationLevel: {
      type: String,
      enum: ["SSCE", "OND", "HND", "BSC", "MSc", "PhD", "Others"],
      required: [true, "Education level is required"],
    },
    linkedInProfile: {
      type: String,
      required: [true, "LinkedIn profile is required"],
    },
    serviceOffering: {
      type: String,
      required: [true, "Service offering selection is required"],
    },
    motivation: {
      type: String,
      required: [true, "Motivation is required"],
    },
    expectedOutcomes: {
      type: String,
      required: [true, "Expected outcomes are required"],
    },
    challenges: {
      type: String,
      required: [true, "Specific challenges/goals are required"],
    },
    successMeasurement: {
      type: String,
      required: [true, "Success measurement is required"],
    },
    furtherQuestions: {
      type: String,
    },
    willingToAttendNext: {
      type: Boolean,
      default: false,
    },
    feeCommitment: {
      type: Boolean,
      default: false,
    },
    receiptUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["paystack", "manual"],
      required: true,
    },
    paystackReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
