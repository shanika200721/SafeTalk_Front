import axios from 'axios';

export const LEGACY_ACCESS_TOKEN_KEY = 'access_token';
export const STUDENT_ACCESS_TOKEN_KEY = 'safetalk_student_access_token';
export const LEGACY_USER_KEY = 'user';
export const STUDENT_USER_KEY = 'safetalk_student_user';
export const LEGACY_USER_ROLE_KEY = 'user_role';
export const STUDENT_USER_ROLE_KEY = 'safetalk_student_user_role';

const localApiBaseUrl =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:8000';

const API_BASE_URL = import.meta.env.VITE_API_URL || localApiBaseUrl;

export const getStoredToken = () => localStorage.getItem(STUDENT_ACCESS_TOKEN_KEY) || localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);

export const storeAuthSession = (token, user) => {
  localStorage.setItem(STUDENT_ACCESS_TOKEN_KEY, token);
  localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(STUDENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
    localStorage.setItem(STUDENT_USER_ROLE_KEY, user.role);
    localStorage.setItem(LEGACY_USER_ROLE_KEY, user.role);
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(STUDENT_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(STUDENT_USER_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(STUDENT_USER_ROLE_KEY);
  localStorage.removeItem(LEGACY_USER_ROLE_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
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
      clearAuthSession();
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
