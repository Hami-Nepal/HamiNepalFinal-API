const mongoose = require("mongoose");
const slugify = require("slugify");

const kindnessSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Act of kindness must have a title"],
    },
    type: {
      type: String,
      enum: ["ongoing", "past"],
      default: "ongoing",
    },
    challenges: {
      type: String,
      required: [true, "Act of kindness must have challanges"],
    },
    difficulties: {
      type: String,
      // required: [true, "Act of kindness must have difficulties"],
    },
    photos: {
      type: [String],
    },
    summary: {
      type: String,
      required: [true, "Act of kindness must have a summary"],
    },
    details: {
      type: String,
      // required: [true, "Act of kindness must have a details"],
    },
    balance: {
      type: Number,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    volunteers: [
      {
        volunteerId: {
          type: String,
          unique: [true, "volunteer id should be unique in each events"],
        },
        participated: {
          type: Boolean,
          default: false,
        },
      },
    ],
    results: {
      type: String,
      // required: [true, "Act of kindness must have a results"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featured_ranking: {
      type: Number,
      maxlength: 5,
    },
  },
  { timestamps: true }
);

const Kindness = mongoose.model("kindness", kindnessSchema);

module.exports = Kindness;
