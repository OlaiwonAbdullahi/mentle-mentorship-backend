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
    price_in_ngn: {
      type: Number,
      required: [true, "Please add a course price"],
      min: 0,
    },
    price_in_euro: {
      type: Number,
      required: [true, "Please add a course price"],
      min: 0,
    },
    classSize: {
      type: Number,
      required: [true, "Please add a course class size"],
      min: 0,
    },
    frequency: {
      type: String,
      required: [true, "Please add a course frequency"],
    },
    mode: {
      type: String,
      required: [true, "Please add a course mode"],
    },
    benefits: [
      {
        type: String,
      },
    ],
    duration: {
      type: String,
      required: [true, "Please add course duration"],
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
