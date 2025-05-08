import React, { useState } from 'react';
import { addComment } from '../services/api';

function NewCommentForm({ articleId }) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await addComment(articleId, { author, text });
      setAuthor('');
      setText('');
      // Optionally trigger a refresh
      window.location.reload();
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Add a Comment</h4>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input
        type="text"
        placeholder="Your name"
        value={author}
        onChange={e => setAuthor(e.target.value)}
        required
      />
      <br />
      <textarea
        placeholder="Comment"
        value={text}
        onChange={e => setText(e.target.value)}
        required
      />
      <br />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Add Comment'}
      </button>
    </form>
  );
}

export default NewCommentForm;
