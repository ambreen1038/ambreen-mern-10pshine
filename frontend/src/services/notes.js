import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/notes`,
  timeout: 10000,
  withCredentials: true,
});

// Set Authorization header for each request
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors clearly and consistently
const handleError = (error, defaultMessage) => {
  return {
    message: error.response?.data?.message || defaultMessage,
    code: error.response?.data?.code || 'UNKNOWN_ERROR',
    status: error.response?.status || 500,
  };
};

export const getNotes = async () => {
  try {
    const { data } = await API.get('/');
    return data;
  } catch (error) {
    throw handleError(error, 'Failed to fetch notes');
  }
};

export const searchNotes = async (query) => {
  try {
    const { data } = await API.get('/', { params: { q: query } });
    return data;
  } catch (error) {
    throw handleError(error, 'Failed to search notes');
  }
};

export const getNoteById = async (id) => {
  try {
    const { data } = await API.get(`/${id}`);
    return data;
  } catch (error) {
    throw handleError(error, 'Failed to fetch note');
  }
};

export const createNote = async (noteData) => {
  try {
    const { data } = await API.post('/', noteData);
    return data;
  } catch (error) {
    throw handleError(error, 'Failed to create note');
  }
};

export const updateNote = async (id, noteData) => {
  try {
    const { data } = await API.put(`/${id}`, noteData);
    return data;
  } catch (error) {
    throw handleError(error, 'Failed to update note');
  }
};

export const deleteNote = async (id) => {
  try {
    await API.delete(`/${id}`);
  } catch (error) {
    throw handleError(error, 'Failed to delete note');
  }
};
