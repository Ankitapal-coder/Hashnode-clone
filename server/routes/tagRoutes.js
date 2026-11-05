const express = require("express");
const router = express.Router();

const Tag = require("../models/Tag");
const authMiddleware = require("../middleware/auth");

// ================= CREATE TAG =================

router.post("/", authMiddleware, async (req, res) => {
try {
const { name } = req.body;

if (!name || !name.trim()) {
  return res.status(400).json({
    message: "Tag name is required",
  });
}

const normalizedName = name.trim().toLowerCase();

// Generate URL-friendly slug
const slug = normalizedName
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

if (!slug) {
  return res.status(400).json({
    message: "Invalid tag name",
  });
}

// Check duplicate tag
const existingTag = await Tag.findOne({
  $or: [
    { name: normalizedName },
    { slug: slug },
  ],
});

if (existingTag) {
  return res.status(409).json({
    message: "Tag already exists",
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
console.error("Create Tag Error:", error);

return res.status(500).json({
  message: "Server error while creating tag",
});

}
});

// ================= GET ALL TAGS =================

router.get("/", async (req, res) => {
try {
const tags = await Tag.find().sort({ name: 1 });

return res.status(200).json({
  message: "Tags fetched successfully",
  count: tags.length,
  tags,
});

} catch (error) {
console.error("Fetch Tags Error:", error);

return res.status(500).json({
  message: "Server error while fetching tags",
});

}
});

module.exports = router;