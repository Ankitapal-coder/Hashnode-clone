import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.get("/posts/my-posts");
        setPosts(response.data.posts || response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your articles."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const publishedPosts = posts.filter(
    (post) => post.status === "published"
  );

  const draftPosts = posts.filter(
    (post) => post.status === "draft"
  );

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await API.delete(`/posts/${id}`);

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post._id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete article."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p>Loading your dashboard...</p>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My Dashboard</h1>
          <p>Manage your articles and share your ideas.</p>
        </div>

        <Link to="/write" className="write-btn">
          + Write Article
        </Link>
      </div>

      {error && <p>{error}</p>}

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Articles</h3>
          <h2>{posts.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Published</h3>
          <h2>{publishedPosts.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Drafts</h3>
          <h2>{draftPosts.length}</h2>
        </div>
      </div>

      <div className="articles-section">
        <h2>My Articles</h2>

        {posts.length === 0 ? (
          <div className="empty-state">
            <h3>No articles yet!</h3>
            <p>Start writing your first article.</p>
            <Link to="/write">Create Article</Link>
          </div>
        ) : (
          <div className="dashboard-articles">
            {posts.map((post) => (
              <div className="dashboard-article-card" key={post._id}>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span>{post.status}</span>

                <div className="article-actions">
                  <Link
                    to={`/edit-article/${post._id}`}
                    className="edit-btn"
                  >
                    Edit Article
                  </Link>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDelete(post._id)}
                    disabled={deletingId === post._id}
                  >
                    {deletingId === post._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;