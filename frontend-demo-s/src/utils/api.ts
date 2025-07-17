// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://rj-755j.onrender.com/api', // use Render backend in production
});

export default api;
