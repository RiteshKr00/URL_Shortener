const mongoose = require("mongoose");

const URLSchema = new mongoose.Schema(
  {
    urlId: {
      type: String,
      required: true,
    },
    originalUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: false,
    },
    singleUse: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
const Url = mongoose.model("Url", URLSchema);
module.exports = Url;
