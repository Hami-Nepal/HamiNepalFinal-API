const mongoose = require("mongoose");

const event_typeSchema = new mongoose.Schema(
  {
    event_type: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Am event must have a type"],
    },
  },
  { timestamps: true }
);

const Event_type = mongoose.model("event_type", event_typeSchema);

module.exports = Event_type;
