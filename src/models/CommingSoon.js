const mongoose = require("mongoose");

const CommingSoonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CommingSoon", CommingSoonSchema);
