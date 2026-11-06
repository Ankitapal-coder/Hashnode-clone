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
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
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
      const tagNames = [
        ...new Set(
          formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        ),
      ];

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

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
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

        <div className="write-header">
          <span className="write-label">
            CREATE SOMETHING GREAT
          </span>

          <h1>Write Your Article</h1>

          <p className="write-subtitle">
            Share your knowledge with the developer community.
          </p>
        </div>

        <form className="write-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="title">Article Title</label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter your article title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Short Description</label>

            <input
              id="excerpt"
              name="excerpt"
              type="text"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Write a short description"
            />
          </div>

          <div className="form-group">
            <div className="content-label-row">
              <label htmlFor="content">
                Article Content
              </label>

              <span>Markdown Supported</span>
            </div>

            <textarea
              id="content"
              name="content"
              rows="14"
              value={formData.content}
              onChange={handleChange}
              placeholder="Start writing your article..."
              required
            />
          </div>

          <div className="preview-controls">
            <button
              type="button"
              className="preview-btn"
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
                {formData.content ||
                  "Your preview will appear here..."}
              </ReactMarkdown>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tags">Article Tags</label>

            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="React, JavaScript, Node.js"
            />

            <span className="field-hint">
              Separate multiple tags using commas.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="status">Publishing Status</label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Save as Draft</option>
              <option value="published">Publish Article</option>
            </select>
          </div>

          {message && (
            <p className="write-message">{message}</p>
          )}

          <div className="write-actions">
            <button
              type="submit"
              className="publish-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Article"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Write;