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

    message: {
      type: String,
      required: [true, "A board member must provide a message"],
    },
    // facebookLink: {
    //   type: String,
    // },
    // instaLink: {
    //   type: String,
    // },
    // twitterLink: {
    //   type: String,
    // },
    // linkedLink: {
    //   type: String,
    // },
    socialMediaLinks: {
      type: {},
    },
    photo: {
      type: String,
      required: [true, "A board member must have a picture"],
    },
  },
  { timestamps: true }
);

const BoardMember = mongoose.model("BoardMember", boardMemberSchema);

module.exports = BoardMember;
