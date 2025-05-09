import React, { useState } from 'react';
import { addComment } from '../services/api';

function NewCommentForm({ articleId, onCommentAdded }) {
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim() || !text.trim()) {
      setError("Email and comment text are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      // Basic email validation
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await addComment(articleId, {
        author_email: email,
        text,
      });
      onCommentAdded(response.data); // Notify parent component
      setEmail("");
      setText("");
      setSuccess(
        "Comment added successfully! It will appear in the list shortly."
      ); // Adjusted message
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to add comment:", err);
      let errorMessage = "Failed to add comment.";
      if (err.response && err.response.data) {
        const drfErrors = err.response.data;
        if (typeof drfErrors === "object") {
          errorMessage +=
            " " +
            Object.entries(drfErrors)
              .map(
                ([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
              )
              .join("; ");
        } else if (typeof drfErrors === "string") {
          errorMessage += " " + drfErrors;
        }
      } else if (err.message) {
        errorMessage += " " + err.message;
      }
      setError(errorMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: "20px",
        borderTop: "1px solid #eee",
        paddingTop: "20px",
      }}
    >
      <h4>Add a Comment</h4>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <div style={{ marginBottom: "10px" }}>
        <label
          htmlFor={`email-${articleId}`}
          style={{ display: "block", marginBottom: "5px" }}
        >
          Email:
        </label>
        <input
          type="email"
          id={`email-${articleId}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "300px", padding: "8px", boxSizing: "border-box" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label
          htmlFor={`text-${articleId}`}
          style={{ display: "block", marginBottom: "5px" }}
        >
          Comment:
        </label>
        <textarea
          id={`text-${articleId}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          style={{
            width: "300px",
            height: "80px",
            padding: "8px",
            boxSizing: "border-box",
          }}
        />
      </div>
      <button type="submit" style={{ padding: "10px 15px" }}>
        Submit Comment
      </button>
    </form>
  );
}
export default NewCommentForm;