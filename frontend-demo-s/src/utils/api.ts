// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // use tunnel URL in production
});

export default api;
