// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://rj-755j.onrender.com/api', // Updated to use deployed backend
});

export default api;
