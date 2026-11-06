const express = require("express");
const router = express.Router();

const Tag = require("../models/Tag");
const authMiddleware = require("../middleware/auth");

// Create a new tag
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body || {};

    if (typeof name !== "string") {
      return res.status(400).json({
        message: "Tag name must be a valid string",
      });
    }

    const normalizedName = name.trim().toLowerCase();

    if (normalizedName.length < 2 || normalizedName.length > 30) {
      return res.status(400).json({
        message: "Tag name must be between 2 and 30 characters",
      });
    }

    const slug = normalizedName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug || slug.length < 2 || slug.length > 40) {
      return res.status(400).json({
        message: "Invalid tag name",
      });
    }

    const existingTag = await Tag.findOne({
      $or: [{ name: normalizedName }, { slug }],
    });

    if (existingTag) {
      return res.status(409).json({
        message: "This tag already exists",
      });
    }

    const newTag = await Tag.create({
      name: normalizedName,
      slug,
    });

    return res.status(201).json({
      message: "Tag created successfully",
      tag: newTag,
    });
  } catch (error) {
    console.error("Create Tag Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This tag already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid tag details",
      });
    }

    return res.status(500).json({
      message: "Server error while creating tag",
    });
  }
});

// Get all tags
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });

    return res.status(200).json({
      count: tags.length,
      tags,
    });
  } catch (error) {
    console.error("Get Tags Error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching tags",
    });
  }
});

module.exports = router;