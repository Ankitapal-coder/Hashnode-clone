import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import API from "../services/api";
import "./Write.css";

function Write() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    status: "draft",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const markdownComponents = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");

      return match ? (
        <SyntaxHighlighter
          language={match[1]}
          style={oneDark}
          PreTag="div"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const tagNames = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const tagIds = [];

      for (const name of tagNames) {
        const response = await API.post("/tags", { name });
        tagIds.push(response.data.tag._id);
      }

      await API.post("/posts", {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        tags: tagIds,
        status: formData.status,
      });

      setMessage("Article saved successfully!");

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to save article. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-page">
      <div className="write-container">
        <h1>Write Your Article</h1>

        <p className="write-subtitle">
          Share your knowledge with the developer community.
        </p>

        <form className="write-form" onSubmit={handleSubmit}>
          <label>Article Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your article title"
            required
          />

          <label>Excerpt</label>
          <input
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Write a short description"
          />

          <label>Article Content (Markdown Supported)</label>
          <textarea
            name="content"
            rows="12"
            value={formData.content}
            onChange={handleChange}
            placeholder="Start writing your article..."
            required
          />

          <div className="preview-controls">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {showPreview && (
            <div className="markdown-preview">
              <h2>Article Preview</h2>

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {formData.content || "Your preview will appear here..."}
              </ReactMarkdown>
            </div>
          )}

          <label>Tags</label>
          <input
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="React, JavaScript, Node.js"
          />

          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="draft">Save as Draft</option>
            <option value="published">Publish Article</option>
          </select>

          {message && <p>{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Article"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Write;