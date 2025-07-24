// src/services/auth.js

import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api/auth', // configurable endpoint
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach token to each request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized error interceptor
API.interceptors.response.use(
  res => res,
  err => {
    // Show error toast or log globally
    // toast.error(err.response?.data?.message);
    return Promise.reject(err);
  }
);

export const register = data => API.post('/register', data);
export const login = data => API.post('/login', data);
