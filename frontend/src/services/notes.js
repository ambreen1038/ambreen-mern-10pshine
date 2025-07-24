// src/services/notes.js
import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api/notes',
});

// Attach token automatically
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    toast.error(err.response?.data?.message || 'Something went wrong');
    return Promise.reject(err);
  }
);

export const getNotes = () => API.get('/');
export const getNote = id => API.get(`/${id}`);
export const createNote = data => API.post('/', data);
export const updateNote = (id, data) => API.put(`/${id}`, data);
export const deleteNote = id => API.delete(`/${id}`);
