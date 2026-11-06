const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Post = require("../models/Post");
const Tag = require("../models/Tag");
const authMiddleware = require("../middleware/auth");

// Validate tags and check whether they exist
const validateTags = async (tags) => {
  if (!Array.isArray(tags)) {
    return { error: "Tags must be an array" };
  }

  if (!tags.every((id) => typeof id === "string" && mongoose.isValidObjectId(id))) {
    return { error: "Invalid tag ID" };
  }

  const uniqueTags = [...new Set(tags)];

  if (uniqueTags.length !== tags.length) {
    return { error: "Duplicate tags are not allowed" };
  }

  const count = await Tag.countDocuments({
    _id: { $in: uniqueTags },
  });

  if (count !== uniqueTags.length) {
    return { error: "One or more tags do not exist" };
  }

  return { tags: uniqueTags };
};

// Create a post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, excerpt = "", tags = [], status = "draft" } =
      req.body || {};

    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      typeof excerpt !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid article details",
      });
    }

    const cleanTitle = title.trim();

    if (!cleanTitle || cleanTitle.length > 150) {
      return res.status(400).json({
        message: "Title must be between 1 and 150 characters",
      });
    }

    if (!content.trim() || content.length > 100000) {
      return res.status(400).json({
        message: "Content is required and must not exceed 100000 characters",
      });
    }

    if (excerpt.length > 300) {
      return res.status(400).json({
        message: "Excerpt cannot exceed 300 characters",
      });
    }

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        message: "Invalid article status",
      });
    }

    const tagResult = await validateTags(tags);

    if (tagResult.error) {
      return res.status(400).json({
        message: tagResult.error,
      });
    }

    const post = await Post.create({
      title: cleanTitle,
      content,
      excerpt: excerpt.trim(),
      author: req.userId,
      tags: tagResult.tags,
      status,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name username profileImage")
      .populate("tags", "name slug");

    return res.status(201).json({
      message: "Article created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid article details",
      });
    }

    return res.status(500).json({
      message: "Server error while creating article",
    });
  }
});

// Get logged-in user's posts
router.get("/my-posts", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId })
      .populate("author", "name username")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("My Posts Error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching your articles",
    });
  }
});

// Get public published posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" })
      .populate("author", "name username profileImage")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Public Feed Error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching articles",
    });
  }
});

// Get one published post
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid article ID",
      });
    }

    const post = await Post.findOne({
      _id: id,
      status: "published",
    })
      .populate("author", "name username profileImage")
      .populate("tags", "name slug");

    if (!post) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error("Get Post Error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching article",
    });
  }
});

// Update own post
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid article ID",
      });
    }

    const post = await Post.findOne({
      _id: id,
      author: req.userId,
    });

    if (!post) {
      return res.status(404).json({
        message: "Article not found or access denied",
      });
    }

    const body = req.body || {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 150) {
        return res.status(400).json({
          message: "Invalid article title",
        });
      }

      post.title = body.title.trim();
    }

    if (body.content !== undefined) {
      if (typeof body.content !== "string" || !body.content.trim() || body.content.length > 100000) {
        return res.status(400).json({
          message: "Invalid article content",
        });
      }

      post.content = body.content;
    }

    if (body.excerpt !== undefined) {
      if (typeof body.excerpt !== "string" || body.excerpt.length > 300) {
        return res.status(400).json({
          message: "Invalid article excerpt",
        });
      }

      post.excerpt = body.excerpt.trim();
    }

    if (body.status !== undefined) {
      if (!["draft", "published"].includes(body.status)) {
        return res.status(400).json({
          message: "Invalid article status",
        });
      }

      post.status = body.status;
    }

    if (body.tags !== undefined) {
      const tagResult = await validateTags(body.tags);

      if (tagResult.error) {
        return res.status(400).json({
          message: tagResult.error,
        });
      }

      post.tags = tagResult.tags;
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name username profileImage")
      .populate("tags", "name slug");

    return res.status(200).json({
      message: "Article updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update Post Error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid article details",
      });
    }

    return res.status(500).json({
      message: "Server error while updating article",
    });
  }
});

// Delete own post
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid article ID",
      });
    }

    const deletedPost = await Post.findOneAndDelete({
      _id: id,
      author: req.userId,
    });

    if (!deletedPost) {
      return res.status(404).json({
        message: "Article not found or access denied",
      });
    }

    return res.status(200).json({
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Delete Post Error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting article",
    });
  }
});

module.exports = router;