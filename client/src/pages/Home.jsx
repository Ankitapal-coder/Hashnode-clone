import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Home.css";

function Home() {
  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postResponse, tagResponse] = await Promise.all([
          API.get("/posts"),
          API.get("/tags"),
        ]);

        setArticles(
          postResponse.data.posts || postResponse.data
        );

        setTags(
          tagResponse.data.tags || tagResponse.data
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load articles."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredArticles =
    selectedTag === "all"
      ? articles
      : articles.filter((article) =>
          article.tags?.some((tag) =>
            typeof tag === "object"
              ? tag._id === selectedTag
              : tag === selectedTag
          )
        );

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Share Your Ideas.
            <br />
            <span>Inspire The World.</span>
          </h1>

          <p>
            A place where developers share knowledge,
            learn new technologies and grow together.
          </p>

          <Link to="/write" className="hero-btn">
            Start Writing
          </Link>
        </div>
      </section>

      <section className="articles-section">
        <div className="section-header">
          <h2>Latest Articles</h2>
          <p>
            Explore ideas and insights from our community.
          </p>
        </div>

        <div className="tag-filters">
          <button
            className={selectedTag === "all" ? "active" : ""}
            onClick={() => setSelectedTag("all")}
          >
            All
          </button>

          {tags.map((tag) => (
            <button
              key={tag._id}
              className={
                selectedTag === tag._id ? "active" : ""
              }
              onClick={() => setSelectedTag(tag._id)}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading articles...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredArticles.length === 0 ? (
          <div className="empty-articles">
            <h3>No articles found</h3>
            <p>Try selecting another topic.</p>
          </div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map((article) => (
              <div
                className="article-card"
                key={article._id}
              >
                <Link
                  to={`/article/${article._id}`}
                  className="article-link"
                >
                  <h3>{article.title}</h3>
                  <p className="article-excerpt">
                    {article.excerpt ||
                      article.content?.slice(0, 150)}
                  </p>
                </Link>

                <div className="article-meta">
                  <span>
                    By {article.author?.name || "Unknown Author"}
                  </span>

                  <span>
                    {article.tags
                      ?.map((tag) =>
                        typeof tag === "object"
                          ? tag.name
                          : tag
                      )
                      .join(", ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;