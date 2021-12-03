const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "News Section should have title"],
    },
    newsType: {
      type: String,
      enum: ["national", "international"],
      required: [true, "News type is required"],
    },
    summary: {
      type: String,
      required: [true, "News Section should have summary of the news"],
    },
    link: {
      type: String,
      required: [true, "please provide the news link"],
    },
    photo: {
      type: String,
    },
  },
  { timestamps: true }
);

const News = mongoose.model("News", newsSchema);
module.exports = News;
