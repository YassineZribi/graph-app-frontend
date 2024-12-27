import axios from 'axios';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to set the Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage or any secure storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
