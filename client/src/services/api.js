import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
};

// Users
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/change-password', data),
};

// Zones
export const zoneAPI = {
    getAll: () => api.get('/zones'),
    getById: (id) => api.get(`/zones/${id}`),
};

// Dustbins
export const dustbinAPI = {
    getAll: () => api.get('/dustbins'),
    getByZone: (zoneId) => api.get(`/dustbins/zone/${zoneId}`),
    create: (data) => api.post('/dustbins', data),
    updateStatus: (id, status) => api.put(`/dustbins/${id}/status`, { status }),
    delete: (id) => api.delete(`/dustbins/${id}`),
};

// Reports
export const reportAPI = {
    getAll: (params) => api.get('/reports', { params }),
    getById: (id) => api.get(`/reports/${id}`),
    create: (formData) => api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    reassign: (id, workerId) => api.put(`/reports/${id}/reassign`, { worker_id: workerId }),
    reopen: (id) => api.put(`/reports/${id}/reopen`),
};

// Alerts
export const alertAPI = {
    getMyAlerts: () => api.get('/alerts/my-alerts'),
    accept: (id) => api.put(`/alerts/${id}/accept`),
    ignore: (id) => api.put(`/alerts/${id}/ignore`),
    getUnaccepted: () => api.get('/alerts/unaccepted'),
};

// Workers
export const workerAPI = {
    getAll: () => api.get('/workers'),
    assign: (data) => api.post('/workers/assign', data),
    getMyTasks: () => api.get('/workers/my-tasks'),
    resolveTask: (id) => api.put(`/workers/tasks/${id}/resolve`),
    getLeaderboard: (params) => api.get('/workers/leaderboard', { params }),
};

// Dashboard
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getActivities: () => api.get('/dashboard/activities'),
    getWorkerPerformance: () => api.get('/dashboard/worker-performance'),
};

export default api;
