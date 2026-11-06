import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "./Write.css";

function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "draft",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await API.get("/posts/my-posts");
        const posts = response.data.posts || response.data;

        const article = posts.find((post) => post._id === id);

        if (!article) {
          setMessage("Article not found.");
          return;
        }

        setFormData({
          title: article.title || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          status: article.status || "draft",
        });
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Unable to load article."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      await API.put(`/posts/${id}`, formData);
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update article."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="write-page">
        <p>Loading article...</p>
      </div>
    );
  }

  return (
    <div className="write-page">
      <div className="write-container">

        <div className="write-header">
          <span className="write-label">
            UPDATE YOUR CONTENT
          </span>

          <h1>Edit Article</h1>

          <p className="write-subtitle">
            Make changes to your article and save your updates.
          </p>
        </div>

        {message && (
          <p className="write-message">{message}</p>
        )}

        <form className="write-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="title">Article Title</label>

            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter article title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Short Description</label>

            <input
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Write a short description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Article Content</label>

            <textarea
              id="content"
              name="content"
              rows="14"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your article..."
              required
            />
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

          <div className="write-actions">
            <button
              type="button"
              className="preview-btn"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="publish-btn"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Article"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditArticle;