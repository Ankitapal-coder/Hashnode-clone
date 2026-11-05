const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Post = require("../models/post");
const Tag = require("../models/Tag");
const authMiddleware = require("../middleware/auth");

// ================= CREATE POST =================

router.post("/", authMiddleware, async (req, res) => {
try {
const { title, content, excerpt, tags, status } = req.body;

if (!title || !content) {
  return res.status(400).json({
    message: "Title and content are required",
  });
}

if (status && !["draft", "published"].includes(status)) {
  return res.status(400).json({
    message: "Invalid post status",
  });
}

// Validate tag IDs
if (tags && !Array.isArray(tags)) {
  return res.status(400).json({
    message: "Tags must be an array",
  });
}

if (tags && tags.some((id) => !mongoose.isValidObjectId(id))) {
  return res.status(400).json({
    message: "Invalid tag ID",
  });
}

// Check whether tags exist
if (tags && tags.length > 0) {
  const existingTags = await Tag.countDocuments({
    _id: { $in: tags },
  });

  if (existingTags !== new Set(tags.map(String)).size) {
    return res.status(400).json({
      message: "One or more tags do not exist",
    });
  }
}

const newPost = await Post.create({
  title: title.trim(),
  content,
  excerpt: excerpt || "",
  author: req.userId,
  tags: tags || [],
  status: status || "draft",
});

return res.status(201).json({
  message: "Post created successfully",
  post: newPost,
});

} catch (error) {
console.error("Create Post Error:", error);

return res.status(500).json({
  message: "Server error while creating post",
});

}
});

// ================= GET MY POSTS =================

router.get("/my-posts", authMiddleware, async (req, res) => {
try {
const posts = await Post.find({
author: req.userId,
})
.populate("author", "name username")
.populate("tags", "name slug")
.sort({ createdAt: -1 });

return res.status(200).json({
  message: "Your posts fetched successfully",
  count: posts.length,
  posts,
});

} catch (error) {
console.error("Fetch My Posts Error:", error);

return res.status(500).json({
  message: "Server error while fetching your posts",
});

}
});

// ================= PUBLIC PUBLISHED FEED =================

router.get("/", async (req, res) => {
try {
const posts = await Post.find({
status: "published",
})
.populate("author", "name username")
.populate("tags", "name slug")
.sort({ createdAt: -1 });

return res.status(200).json({
  message: "Published posts fetched successfully",
  count: posts.length,
  posts,
});

} catch (error) {
console.error("Public Feed Error:", error);

return res.status(500).json({
  message: "Server error while fetching posts",
});

}
});

// Get Single Published Article
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name username")
      .populate("tags", "name slug");

    if (!post || post.status !== "published") {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    res.status(200).json({
      post,
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch article",
      error: error.message,
    });
  }
});

// ================= UPDATE POST =================

router.put("/:id", authMiddleware, async (req, res) => {
try {
const { id } = req.params;
const { title, content, excerpt, tags, status } = req.body;

if (!mongoose.isValidObjectId(id)) {
  return res.status(400).json({
    message: "Invalid post ID",
  });
}

// Find post owned by logged-in user
const post = await Post.findOne({
  _id: id,
  author: req.userId,
});

if (!post) {
  return res.status(404).json({
    message: "Post not found or access denied",
  });
}

if (title !== undefined) {
  if (!title.trim()) {
    return res.status(400).json({
      message: "Title cannot be empty",
    });
  }
  post.title = title.trim();
}

if (content !== undefined) {
  if (!content.trim()) {
    return res.status(400).json({
      message: "Content cannot be empty",
    });
  }
  post.content = content;
}

if (excerpt !== undefined) {
  post.excerpt = excerpt;
}

if (status !== undefined) {
  if (!["draft", "published"].includes(status)) {
    return res.status(400).json({
      message: "Invalid post status",
    });
  }
  post.status = status;
}

if (tags !== undefined) {
  if (!Array.isArray(tags)) {
    return res.status(400).json({
      message: "Tags must be an array",
    });
  }

  if (tags.some((tagId) => !mongoose.isValidObjectId(tagId))) {
    return res.status(400).json({
      message: "Invalid tag ID",
    });
  }

  const existingTags = await Tag.countDocuments({
    _id: { $in: tags },
  });

  if (existingTags !== new Set(tags.map(String)).size) {
    return res.status(400).json({
      message: "One or more tags do not exist",
    });
  }

  post.tags = tags;
}

await post.save();

return res.status(200).json({
  message: "Post updated successfully",
  post,
});

} catch (error) {
console.error("Update Post Error:", error);

return res.status(500).json({
  message: "Server error while updating post",
});

}
});

// ================= DELETE POST =================

router.delete("/:id", authMiddleware, async (req, res) => {
try {
const { id } = req.params;

if (!mongoose.isValidObjectId(id)) {
  return res.status(400).json({
    message: "Invalid post ID",
  });
}

// Delete only the logged-in user's post
const deletedPost = await Post.findOneAndDelete({
  _id: id,
  author: req.userId,
});

if (!deletedPost) {
  return res.status(404).json({
    message: "Post not found or access denied",
  });
}

return res.status(200).json({
  message: "Post deleted successfully",
});

} catch (error) {
console.error("Delete Post Error:", error);

return res.status(500).json({
  message: "Server error while deleting post",
});

}
});

module.exports = router;