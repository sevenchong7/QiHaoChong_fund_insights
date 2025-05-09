import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArticle } from '../services/api';
import NewCommentForm from "./NewCommentForm"; // Component is ready to be used

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState("");

  const fetchArticleData = () => {
    if (id) {
      getArticle(id)
        .then((response) => setArticle(response.data))
        .catch((err) => {
          console.error(`Failed to fetch article ${id}:`, err);
          setError(`Failed to load article ${id}.`);
        });
    }
  };

  useEffect(() => {
    fetchArticleData();
  }, [id]);

  // This function needs to be effectively used to update the UI after a comment is added (Task 3)
  const handleCommentAdded = (newComment) => {
    console.log("New comment submitted in parent, data:", newComment);
    // Candidate needs to ensure this (or an alternative) correctly updates the comment list
    fetchArticleData();
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!article) return <p>Loading article...</p>;

  return (
    <div>
      <h1>{article.title}</h1>
      {/* This part will not display publication date correctly until Task 2 is solved */}
      {article.publication_date ? (
        <p>
          <small>
            Published: {new Date(article.publication_date).toLocaleDateString()}
          </small>
        </p>
      ) : (
        <p>
          <small>(Publication date not available)</small>
        </p>
      )}
      {article.fund_name && (
        <p>
          <small>Related Fund: {article.fund_name}</small>
        </p>
      )}
      <div
        style={{ marginTop: "15px", marginBottom: "20px", lineHeight: "1.6" }}
        dangerouslySetInnerHTML={{
          __html: article.content
            ? article.content.replace(/\n/g, "<br />")
            : "",
        }}
      />

      <h3>Comments</h3>
      {article.comments && article.comments.length > 0 ? (
        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
          {article.comments.map((comment) => (
            <li
              key={comment.id}
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: "0 0 5px 0" }}>{comment.text}</p>
              <small>
                By: {comment.author_email} on{" "}
                {new Date(comment.created_date).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
      {/* NewCommentForm is rendered; its successful operation and UI update are part of Task 3 */}
      <NewCommentForm
        articleId={article.id}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
}
export default ArticleDetail;