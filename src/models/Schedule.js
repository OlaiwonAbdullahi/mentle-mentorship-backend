const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Please add a course ID"],
    },
    title: {
      type: String,
      required: [true, "Please add a schedule title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a schedule description"],
    },
    week: {
      type: Number,
      required: [true, "Please add a schedule week"],
      min: 0,
    },
    facilitator: {
      type: String,
      required: [true, "Please add a facilitator"],
    },
    date: {
      type: String,
      required: [true, "Please add a date"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
