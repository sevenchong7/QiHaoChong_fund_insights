import axios from 'axios';

const API_URL = "http://localhost:8000/api"; // Django dev server

export const getArticles = () => axios.get(`${API_URL}/articles/`);
export const getArticle = (id) => axios.get(`${API_URL}/articles/${id}/`);
export const addComment = (articleId, commentData) =>
  axios.post(`${API_URL}/articles/${articleId}/add_comment/`, commentData);
export const getFund = () => axios.get(`${API_URL}/funds/`);