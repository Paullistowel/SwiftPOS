import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000, // 45s — tolerate Neon cold-starts
});

/**
 * Transient-error retry: 503 (backend says DB unavailable) or network-level
 * errors (ECONNREFUSED, timeout, no response). Retries up to 2 times with
 * 1s / 2s backoff. Non-transient errors fall through untouched.
 */
async function retryRequest(error) {
  const cfg = error.config;
  if (!cfg || cfg.__isRetry >= 2) return Promise.reject(error);

  const transient =
    error.response?.status === 503 ||
    error.response?.data?.transient === true ||
    (!error.response && error.code !== 'ERR_CANCELED');

  if (!transient) return Promise.reject(error);

  cfg.__isRetry = (cfg.__isRetry || 0) + 1;
  const delay = cfg.__isRetry === 1 ? 1000 : 2000;
  await new Promise((r) => setTimeout(r, delay));
  return api(cfg);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // First: attempt transient retry (Neon waking up, brief network hiccup)
    try {
      return await retryRequest(error);
    } catch (finalErr) {
      // Only *real* auth failures should log the user out. DB unavailability
      // surfaces as 503 and is already handled above.
      const isDemoMode = localStorage.getItem('swift-pos-token') === 'demo-mode-token';
      if (finalErr.response?.status === 401 && !isDemoMode) {
        localStorage.removeItem('swift-pos-token');
        localStorage.removeItem('swift-pos-user');
        delete api.defaults.headers.common['Authorization'];
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(finalErr);
    }
  }
);

export default api;
