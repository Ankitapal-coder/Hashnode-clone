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

        setArticles(postResponse.data.posts || postResponse.data);
        setTags(tagResponse.data.tags || tagResponse.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load articles."
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

      {/* Hero Section */}
      <section className="hero">
        <span className="hero-label">A COMMUNITY FOR DEVELOPERS</span>

        <h1>
          Share Your Ideas.
          <br />
          Inspire The World.
        </h1>

        <p className="hero-description">
          A place where developers share knowledge,
          learn new technologies and grow together.
        </p>

        <Link to="/write" className="write-btn">
          Start Writing
        </Link>
      </section>

      {/* Articles Section */}
      <section className="articles-section">

        <div className="section-header">
          <h2>Latest Articles</h2>
          <p className="section-description">
            Explore ideas and insights from our community.
          </p>
        </div>

        {/* Tag Filters */}
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
              className={selectedTag === tag._id ? "active" : ""}
              onClick={() => setSelectedTag(tag._id)}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* Articles */}
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
          <div className="article-grid">
            {filteredArticles.map((article) => (
              <div className="article-card" key={article._id}>

                <div className="article-tags">
                  {article.tags?.map((tag, index) => (
                    <span className="article-tag" key={tag._id || index}>
                      {typeof tag === "object" ? tag.name : tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/article/${article._id}`}
                  className="article-link"
                >
                  <h3>{article.title}</h3>

                  <p>
                    {article.excerpt ||
                      article.content?.slice(0, 150)}
                  </p>

                  <span className="read-more">Read Article →</span>
                </Link>

                <div className="article-author">
                  By {article.author?.name || "Unknown Author"}
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