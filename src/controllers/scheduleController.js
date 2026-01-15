const Schedule = require("../models/Schedule");
const Course = require("../models/Course");

// Get all schedules
const getSchedules = async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = {};

    if (courseId) {
      filter.courseId = courseId;
    }

    const schedules = await Schedule.find(filter)
      .populate("courseId", "title")
      .sort({ week: 1 });

    res.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single schedule
const getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate(
      "courseId",
      "title"
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create schedule (Admin only)
const createSchedule = async (req, res) => {
  try {
    const { courseId, title, description, week, facilitator, date } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const schedule = await Schedule.create({
      courseId,
      title,
      description,
      week,
      facilitator,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update schedule (Admin only)
const updateSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    // If courseId is being updated, verify new course exists
    if (
      req.body.courseId &&
      req.body.courseId !== schedule.courseId.toString()
    ) {
      const course = await Course.findById(req.body.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
    }

    schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("courseId", "title");

    res.json({
      success: true,
      message: "Schedule updated successfully",
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete schedule (Admin only)
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    await Schedule.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Schedule deleted successfully",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get schedules for a specific course
const getCourseSchedules = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const schedules = await Schedule.find({ courseId }).sort({ week: 1 });

    res.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getCourseSchedules,
};
