import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../services/api';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getArticles()
      .then(setArticles)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading articles...</div>;
  if (error) return <div>Error loading articles.</div>;

  return (
    <div>
      <h1>Fund Insights</h1>
      <ul>
        {articles.map(article => (
          <li key={article.id}>
            <Link to={`/articles/${article.id}`}>{article.title}</Link>
            <p>{article.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ArticleList;
