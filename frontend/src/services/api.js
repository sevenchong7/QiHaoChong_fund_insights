import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

export const getArticles = async () => {
  const response = await axios.get(`${API_BASE}/articles/`);
  return response.data;
};

export const getArticle = async (id) => {
  const response = await axios.get(`${API_BASE}/articles/${id}/`);
  return response.data;
};

export const addComment = async (articleId, comment) => {
  const response = await axios.post(`${API_BASE}/articles/${articleId}/comments/`, comment);
  return response.data;
};
