const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    // type: {
    //   type: String,
    //   required: [true, "Please enter a type"],
    // },

    is_anonymous: {
      type: Boolean,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    category: {
      type: String,
      enum: ["cause", "event", "adminstration", "volunteer", "kindness"],
      required: [true, "Please specify your donation category"],
    },
    cause: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cause",
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    kindness: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "kindness",
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
    },
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },
    street_address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zip_code: {
      type: Number,
    },
    country: {
      type: String,
    },
    donation_amount: {
      type: Number,
      required: [true, "Please enter an donation_amount"],
    },
    payment_type: {
      type: String,
      required: [true, "Please enter an payment_type"],
    },
    donation_message: {
      type: String,
      required: [true, "Please enter an donation_message"],
    },
    isVerified: {
      type: Boolean,
    },
    khaltiToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);

module.exports = Donation;
