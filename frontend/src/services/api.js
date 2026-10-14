import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? 'http://localhost:8000/api' : '/api'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const fetchTrafficSummary = () => api.get('/traffic');
export const fetchAnalytics = () => api.get('/analytics');
export const fetchHistory = () => api.get('/history');
export const fetchLocations = () => api.get('/locations');
export const fetchRoutes = () => api.get('/routes');
export const fetchRouteAlternatives = (payload) => api.post('/routes/alternatives', payload);
export const predictTraffic = (payload) => api.post('/predict', payload);

export default api;
