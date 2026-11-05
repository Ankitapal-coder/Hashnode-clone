import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

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
        setMessage("Unable to load article.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/posts/${id}`, formData);
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to update article."
      );
    }
  };

  if (loading) return <p>Loading article...</p>;

  return (
    <div className="write-page">
      <div className="write-container">
        <h1>Edit Article</h1>

        {message && <p>{message}</p>}

        <form className="write-form" onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Excerpt</label>
          <input
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
          />

          <label>Content</label>
          <textarea
            name="content"
            rows="12"
            value={formData.content}
            onChange={handleChange}
            required
          />

          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <button type="submit">Update Article</button>
        </form>
      </div>
    </div>
  );
}

export default EditArticle;