const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const volunteerSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "A volunteer must have a first name"],
    },
    last_name: {
      type: String,
      required: [true, "A volunteer must have a last name"],
    },
    phone: {
      type: Number,
      required: [true, "A volunteer must have a phone number"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      trim: true,
      unique: [true, "Email already taken"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be minimum of 8 lengths"],
      select: false,
    },
    age: {
      type: Number,
      // required: [true, "A volunteer must provide an age"],
    },
    bloodGroup: {
      type: String,
      enum: [
        "A +ve",
        "B +ve",
        "A -ve",
        "AB +ve",
        "AB -ve",
        "B -ve",
        "O +ve",
        "O -ve",
      ],
      // required: [true, "A volunteer must provide an age"],
    },
    field_of_expertise: {
      type: String,
      // required: [true, "A volunteer must have a field of expertise"],
    },
    bio: {
      type: String,
      required: [
        true,
        "A volunteer must have a bio or peoject involved description",
      ],
    },
    motivation: {
      type: String,
      required: [true, "A volunteer must have a motivation to join"],
    },
    country: {
      type: String,
      required: [true, "A volunteer must have a country"],
    },
    photo: {
      type: String,
    },
    state: {
      type: String,
      required: [true, "A volunteer must have a state"],
      enum: [
        "Province 1",
        "Province 2",
        "Bagmati",
        "Gandaki",
        "Lumbini",
        "Karnali",
        "Sudurpashchim",
      ],
    },
    city: {
      type: String,
      required: [true, "A volunteer must have a city"],
    },
    street_address: {
      type: String,
      required: [true, "A volunteer must have a street address"],
    },
    project_worked: {
      type: String,
    },
    event_involvement: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Event",
    },
    cause_involvement: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Cause",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

volunteerSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

volunteerSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

module.exports = Volunteer;
