import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30s timeout — gives cold-start servers time to wake up
  headers: { 'Content-Type': 'application/json' }
});

// Automatic retry interceptor for failed requests (handles cold starts)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;
    const maxRetries = 3;

    // Only retry on network errors or 5xx server errors (not 4xx client errors)
    const isRetryable = !error.response || (error.response.status >= 500);

    if (config.__retryCount < maxRetries && isRetryable) {
      config.__retryCount += 1;
      const delay = Math.min(1000 * Math.pow(2, config.__retryCount - 1), 8000); // 1s, 2s, 4s
      console.log(`API retry ${config.__retryCount}/${maxRetries} for ${config.url} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

// Dashboard APIs

// Simple in-memory cache to prevent constant loading spinners when switching tabs
const cache = new Map();

// Helper to handle caching
const fetchWithCache = async (key, fetcher, ttl = 60000) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }
  
  const response = await fetcher();
  cache.set(key, { data: response, timestamp: Date.now() });
  return response;
};

export const getDashboardOverview = () => fetchWithCache('/dashboard/overview', () => api.get('/dashboard/overview'));
export const getCityDashboard = (city) => fetchWithCache(`/dashboard/city/${city}`, () => api.get(`/dashboard/city/${city}`));
export const getHealthAdvice = (category) => fetchWithCache(`/dashboard/health-advice/${category}`, () => api.get(`/dashboard/health-advice/${category}`), 300000); // 5 min cache
export const getAllHealthAdvice = () => fetchWithCache('/dashboard/health-advice', () => api.get('/dashboard/health-advice'), 300000);

// Water Bodies APIs
export const getWaterBodies = (params) => fetchWithCache(`/water-bodies?${new URLSearchParams(params).toString()}`, () => api.get('/water-bodies', { params }));
export const getWaterBody = (id) => fetchWithCache(`/water-bodies/${id}`, () => api.get(`/water-bodies/${id}`));
export const getWaterBodyReadings = (id, params) => api.get(`/water-bodies/${id}/readings`, { params }); // Usually don't cache realtime readings
export const getWaterBodyTrends = (id) => fetchWithCache(`/water-bodies/${id}/trends`, () => api.get(`/water-bodies/${id}/trends`));

export default api;
