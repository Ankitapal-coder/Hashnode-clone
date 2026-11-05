import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import API from "../services/api";
import "./ArticleDetails.css";

function ArticleDetails() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await API.get(`/posts/${id}`);
        setArticle(response.data.post || response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Article not found."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <p>Loading article...</p>;
  if (error) return <p>{error}</p>;
  if (!article) return <p>Article not found.</p>;

  return (
    <div className="article-detail-page">
      <div className="article-detail-container">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

        <h1>{article.title}</h1>

        <p className="article-author">
          By {article.author?.name || "Unknown Author"}
        </p>

        <p className="article-detail-excerpt">
          {article.excerpt}
        </p>

        <div className="article-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
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
            }}
          >
            {article.content || ""}
          </ReactMarkdown>
        </div>

        <div className="article-tags">
          {article.tags?.map((tag, index) => (
            <span key={tag._id || index}>
              {typeof tag === "object" ? tag.name : tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ArticleDetails;