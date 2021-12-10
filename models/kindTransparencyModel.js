const mongoose = require("mongoose");
const slugify = require("slugify");

const kindTransparencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Kind transparency must have a name"],
    },
    type: {
      type: String,
      enum: ["cause", "event"],
      required: [true, "A Kind transparency must have a type"],
    },
    photos: {
      type: [String],
      required: [true, "photos are required"],
    },
    amount: {
      type: Number,
      required: [true, "A kind transparency must have the amount spent"],
    },
    description: {
      type: String,
      required: [true, "A kind transparency must have a description"],
    },
    slug: { type: String },
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
  },
  { timestamps: true }
);

kindTransparencySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const KindTransparency = mongoose.model(
  "KindTransparency",
  kindTransparencySchema
);

module.exports = KindTransparency;
