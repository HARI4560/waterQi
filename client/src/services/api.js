import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

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
