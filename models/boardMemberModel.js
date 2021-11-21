const mongoose = require("mongoose");

const boardMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A board member must have a  name"],
    },
    designation: {
      type: String,
      required: [true, "A board member must have a designation"],
    },
    slug: { type: String },
    message: {
      type: String,
      required: [true, "A board member must provide a message"],
    },
    socialMediaLinks: {
      type: [String],
      required: [true, "A board member must provide their social media links"],
    },
    photo: {
      type: String,
      required: [true, "A board member must have a picture"],
    },
  },
  { timestamps: true }
);

boardMemberSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const BoardMember = mongoose.model("BoardMember", boardMemberSchema);

module.exports = BoardMember;
