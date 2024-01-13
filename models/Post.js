const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId,
  },
  commentTime: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
  },
  virtId: {
    type: String,
  },
  comment: {
    type: String,
  },
});
const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
