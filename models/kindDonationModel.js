const mongoose = require("mongoose");
const validator = require("validator");

const kindDonationSchema = new mongoose.Schema(
  {
    slug: { type: String },
    donerType: {
      type: String,
      enum: ["Organization", "Individual"],
      required: [true, "Please enter a type"],
    },
    donerFullName: {
      type: String,
    },
    donerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phoneNumber: {
      type: String,
    },
    category: {
      type: String,
      enum: ["cause", "event"],
      required: [true, "Please specify your donation category"],
    },
    event: {
      type: String,
      required: false,
    },
    event_name: {
      type: String,
      required: false,
    },
    cause: {
      type: String,
      required: false,
    },
    cause_name: {
      type: String,
      required: false,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    donatedItem: {
      type: String,
      required: [true, "Please enter the intem name"],
    },
    itemWorth: {
      type: Number,
      required: [true, "Please Enter the item worth amount"],
    },
    quantity: {
      type: Number,
      requried: [true, "Please Enter the item Quantity"],
    },
    photos: {
      type: [String],
      required: [true, "please upload the photos"],
    },
  },
  { timestamps: true }
);

const KindDonation = mongoose.model("KindDonation", kindDonationSchema);

module.exports = KindDonation;
