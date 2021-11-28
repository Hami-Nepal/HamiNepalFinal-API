const mongoose = require("mongoose");

const civilRightsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A civil right movement must have a title"],
    },
    introduction: {
      type: String,
      required: [true, "A civil right movement must have an introduction"],
    },
    photos: {
      type: [String],
    },
    body1: {
      type: String,
      required: [true, "A civil right movement must have a body"],
    },
    body2: {
      type: String,
    },
    summary: {
      type: String,
    },
  },

  { timestamps: true }
);

const CivilRights = mongoose.model("CivilRights", civilRightsSchema);

module.exports = CivilRights;
