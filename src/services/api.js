import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // IMPORTANT: Only set Content-Type for non-FormData requests
  // For FormData (multipart), let the browser/axios handle it automatically
  if (config.data && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  // Log the request for debugging
  if (config.url?.includes('send-voice')) {
    console.log('📤 Sending voice request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      dataType: config.data?.constructor.name,
      dataSize: config.data?.size || config.data?.length
    });
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('send-voice')) {
      console.log('✅ Voice message response:', response.status, response.data);
    }
    return response;
  },
  (error) => {
    if (error.config?.url?.includes('send-voice')) {
      console.error('❌ Voice message error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    if (error.response?.status === 401) {
      // Token expired or invalid - clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Risk assessment API
export const assessRisk = async (userId, scores, profileData = null) => {
  try {
    const response = await api.post('/api/risk/assess', {
      user_id: userId,
      scores: scores,
      profile_data: profileData
    });
    return response.data;
  } catch (error) {
    console.error('Risk assessment error:', error);
    throw error;
  }
};

// Get weights
export const getWeights = async () => {
  try {
    const response = await api.get('/api/weights');
    return response.data;
  } catch (error) {
    console.error('Get weights error:', error);
    throw error;
  }
};

// Calculate profile score
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