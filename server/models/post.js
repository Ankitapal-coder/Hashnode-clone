const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 1,
      maxlength: 150,
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: 1,
      maxlength: 100000,
    },

    excerpt: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate tag references
postSchema.path("tags").validate(function (tags) {
  const tagIds = tags.map((id) => id.toString());
  return tagIds.length === new Set(tagIds).size;
}, "Duplicate tags are not allowed");

const Post = mongoose.model("Post", postSchema);

module.exports = Post;