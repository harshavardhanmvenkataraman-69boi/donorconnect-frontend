import axios from 'axios';

// During development we use Vite's proxy (see vite.config.js) to avoid CORS.
// Keep baseURL empty so requests like `/api/...` are sent to the dev server
// and proxied to the backend.
const api = axios.create({
  baseURL: '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
