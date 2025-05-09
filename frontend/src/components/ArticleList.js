import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../services/api';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getArticles()
      .then((response) => setArticles(response.data))
      .catch((err) => {
        console.error("Failed to fetch articles:", err);
        setError("Failed to load articles. Please try again later.");
      });
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!articles.length && !error) return <p>Loading articles...</p>;

  return (
    <div>
      <h2>Investment Insights</h2>
      {articles.length === 0 && !error && <p>No articles found.</p>}
      <ul>
        {articles.map((article) => (
          <li
            key={article.id}
            style={{
              marginBottom: "10px",
              paddingBottom: "5px",
              borderBottom: "1px dotted #eee",
            }}
          >
            <Link to={`/articles/${article.id}`} style={{ fontSize: "1.2em" }}>
              {article.title}
            </Link>
            <br />
            {/* This part will not display publication date correctly until Task 2 is solved */}
            {article.publication_date ? (
              <small style={{ marginLeft: "0px", color: "gray" }}>
                {" "}
                {/* Adjusted margin for consistency */}
                Published:{" "}
                {new Date(article.publication_date).toLocaleDateString()}
              </small>
            ) : (
              <small style={{ marginLeft: "0px", color: "lightgray" }}>
                {" "}
                (Publication date not available)
              </small>
            )}
            {article.fund_name && (
              <small style={{ marginLeft: "10px", color: "blue" }}>
                Fund: {article.fund_name}
              </small>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default ArticleList;