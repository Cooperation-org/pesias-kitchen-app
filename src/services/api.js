import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const qrService = {
  generateQR: (activityId) => api.get(`/qr/generate/${activityId}`),
  verifyQR: (data) => api.post('/qr/verify', data),
};

export const activityService = {
  getActivities: () => api.get('/activities'),
  getActivity: (id) => api.get(`/activities/${id}`),
  createActivity: (activityData) => api.post('/activities', activityData),
};

export default api;