const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a course title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a course description"],
    },
    price: {
      type: Number,
      required: [true, "Please add a course price"],
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "GBP", "EUR"],
    },
    duration: {
      type: String,
      required: [true, "Please add course duration"],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
    },
    syllabus: [
      {
        title: String,
        description: String,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);
