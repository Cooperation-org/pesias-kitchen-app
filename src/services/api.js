import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add authentication token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth

export const getNonce = (walletAddress) => api.post('/auth/nonce', { walletAddress });
export const verifySignature = (walletAddress, signature) => api.post('/auth/verify', { walletAddress, signature });

// QR Codes
export const generateQRCode = (data) => api.post('/qr/generate', data);
export const verifyQRCode = (qrData) => api.post('/qr/verify', { qrData });

// Activities
export const recordActivity = (data) => api.post('/activity/record', data);
export const mintActivityNFT = (activityId) => api.post(`/activity/mint/${activityId}`);
export const getUserActivities = () => api.get('/activity/user');



// User endpoints
export const getCurrentUser = () => api.get('/user/profile');
export const updateProfile = (data) => api.put('/user/profile', data);

// Admin-only user endpoints
export const getAllUsers = () => api.get('/user');
export const getUserById = (userId) => api.get(`/user/${userId}`);
export const updateUserRole = (userId, role) => api.put(`/user/${userId}/role`, { role });

// Event endpoints
export const getEvents = () => api.get('/event');
export const getEventById = (eventId) => api.get(`/event/${eventId}`);
export const createEvent = (data) => api.post('/event', data);
export const updateEvent = (eventId, data) => api.put(`/event/${eventId}`, data);
export const deleteEvent = (eventId) => api.delete(`/event/${eventId}`);
export const joinEvent = (eventId) => api.post(`/event/${eventId}/join`);
export const leaveEvent = (eventId) => api.post(`/event/${eventId}/leave`);

export default api;