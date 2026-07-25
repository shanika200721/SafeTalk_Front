import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const assessRisk = async (userId, scores, profileData = null) => {
  try {
    const response = await api.post('/api/risk/assess', {
      user_id: userId,
      scores,
      profile_data: profileData,
    });
    return response.data;
  } catch (error) {
    console.error('Risk assessment error:', error);
    throw error;
  }
};

export const getWeights = async () => {
  try {
    const response = await api.get('/api/weights');
    return response.data;
  } catch (error) {
    console.error('Get weights error:', error);
    throw error;
  }
};

export const calculateProfileScore = async (profileData) => {
  try {
    const response = await api.post('/api/calculate/profile_score', profileData);
    return response.data;
  } catch (error) {
    console.error('Profile score error:', error);
    throw error;
  }
};

export default api;
