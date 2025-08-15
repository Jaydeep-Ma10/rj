// src/utils/api.ts
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
});

// Add a request interceptor to include the auth token with each request
api.interceptors.request.use(
  (config) => {
    // Get auth data from localStorage
    const authData = localStorage.getItem('auth');
    
    // If auth data exists, parse it and get the token
    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Authentication error:', error.response?.data?.message || 'Unauthorized');
      // You can add redirect logic here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
