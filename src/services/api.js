import axios from 'axios';

// API base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// API Service class
class ApiService {
  // Auth endpoints
  async login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  }

  async register(username, name, email, password) {
    const response = await api.post('/auth/register', { username, name, email, password });
    return response.data;
  }

  // Collections endpoints
  async getCollections() {
    const response = await api.get('/collections');
    return response.data;
  }

  async createCollection(name, description) {
    const response = await api.post('/collections', { name, description });
    return response.data;
  }

  async updateCollection(id, name, description) {
    const response = await api.put(`/collections/${id}`, { name, description });
    return response.data;
  }

  async deleteCollection(id) {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  }

  // Tasks endpoints
  async getTasksByCollection(collectionId) {
    const response = await api.get(`/collections/${collectionId}/tasks`);
    return response.data;
  }

  async createTask(collectionId, taskData) {
    const response = await api.post(`/collections/${collectionId}/tasks`, taskData);
    return response.data;
  }

  async updateTask(taskId, taskData) {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  }

  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  }

  async addMoneyToTask(taskId, amount) {
    const response = await api.post(`/tasks/${taskId}/add-money`, { amount });
    return response.data;
  }

  // Helper methods
  setToken(token) {
    localStorage.setItem('token', token);
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export default new ApiService();