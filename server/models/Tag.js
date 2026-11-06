const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 30,
    },

    slug: {
      type: String,
      required: [true, "Tag slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 40,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
  },
  {
    timestamps: true,
  }
);

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;