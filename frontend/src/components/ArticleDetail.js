import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArticle } from '../services/api';
import NewCommentForm from './NewCommentForm';

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getArticle(id)
      .then(setArticle)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading article...</div>;
  if (error) return <div>Error loading article.</div>;
  if (!article) return null;

  return (
    <div>
      <h2>{article.title}</h2>
      <div>{article.content}</div>
      <h3>Comments</h3>
      <ul>
        {article.comments && article.comments.length > 0 ? (
          article.comments.map(comment => (
            <li key={comment.id}>
              <strong>{comment.author}</strong>: {comment.text}
            </li>
          ))
        ) : (
          <li>No comments yet.</li>
        )}
      </ul>
      <NewCommentForm articleId={id} />
    </div>
  );
}

export default ArticleDetail;
