import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Dashboard APIs
export const getDashboardOverview = () => api.get('/dashboard/overview');
export const getCityDashboard = (city) => api.get(`/dashboard/city/${city}`);
export const getHealthAdvice = (category) => api.get(`/dashboard/health-advice/${category}`);
export const getAllHealthAdvice = () => api.get('/dashboard/health-advice');

// Water Bodies APIs
export const getWaterBodies = (params) => api.get('/water-bodies', { params });
export const getWaterBody = (id) => api.get(`/water-bodies/${id}`);
export const getWaterBodyReadings = (id, params) => api.get(`/water-bodies/${id}/readings`, { params });
export const getWaterBodyTrends = (id) => api.get(`/water-bodies/${id}/trends`);

export default api;
