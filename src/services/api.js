import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on real 401s, not when backend is down or in demo mode
    const isDemoMode = localStorage.getItem('swift-pos-token') === 'demo-mode-token';
    if (error.response?.status === 401 && !isDemoMode) {
      localStorage.removeItem('swift-pos-token');
      localStorage.removeItem('swift-pos-user');
      delete api.defaults.headers.common['Authorization'];
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
