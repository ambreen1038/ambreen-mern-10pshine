// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

const getTokenStorage = () =>
  localStorage.getItem('token') ? localStorage : sessionStorage;

const updateAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const storedToken = getTokenStorage().getItem('token');
updateAuthHeader(storedToken);

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getTokenStorage().getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = error.response?.data?.message || error.message;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh-token');
        const newToken = data.token;
        const storage = getTokenStorage();
        storage.setItem('token', newToken);
        updateAuthHeader(newToken);

        onRefreshed(newToken);
        return api(originalRequest);
      } catch (err) {
        ['token', 'user'].forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        updateAuthHeader(null);

        window.dispatchEvent(
          new CustomEvent('authError', {
            detail: {
              type: 'SESSION_EXPIRED',
              message: 'Your session has expired. Please log in again.',
            },
          })
        );
        return Promise.reject({
          message: 'Session expired',
          originalError: err,
        });
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// === Auth Service ===
export const authService = {
  async login(email, password, rememberMe = false) {
    console.log("🟡 authService.login() called", email);
    const { data } = await api.post('/auth/login', { email, password });
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', data.token);
    storage.setItem('user', JSON.stringify(data.user));
    updateAuthHeader(data.token);

    return data;
  },

  async signup(userData) {
    const { data } = await api.post('/auth/register', userData);
    console.log("🟡 authService.signup() called", data);
    // optionally auto-login here
    return data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      ['token', 'user'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      updateAuthHeader(null);
      window.dispatchEvent(new Event('unauthorized'));
    }
  },

  async getCurrentUser() {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.logout();
      }
      throw error;
    }
  },

  async refreshAccessToken() {
    const { data } = await api.post('/auth/refresh-token');
    const token = data.token;

    const storage = getTokenStorage();
    storage.setItem('token', token);
    updateAuthHeader(token);
    return data;
  },
  // Alias for refreshAccessToken (optional)
  async refreshToken() {
  return this.refreshAccessToken();
},
};

export default api;
