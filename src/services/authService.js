import axios from 'axios';
import {
  LEGACY_USER_KEY,
  LEGACY_USER_ROLE_KEY,
  STUDENT_USER_KEY,
  STUDENT_USER_ROLE_KEY,
  clearAuthSession,
  getStoredToken,
  storeAuthSession,
} from './api';

const localApiBaseUrl =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:8000';

const API_BASE_URL = import.meta.env.VITE_API_URL || localApiBaseUrl;

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User information (email, username, password, full_name, role, etc.)
   * @returns {Promise} Registration response
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Student login
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} Login response with token and user data
   */
  loginStudent: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login/student', {
        username,
        password,
      });
      
      if (response.data.access_token) {
        storeAuthSession(response.data.access_token, response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Counselor/Admin login
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} Login response with token and user data
   */
  loginCounselor: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login/counselor', {
        username,
        password,
      });
      
      if (response.data.access_token) {
        storeAuthSession(response.data.access_token, response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Generic login (any role)
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} Login response
   */
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });
      
      if (response.data.access_token) {
        storeAuthSession(response.data.access_token, response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    clearAuthSession();
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getCurrentUserProfile: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} Updated user profile
   */
  updateUserProfile: async (userData) => {
    try {
      const response = await apiClient.put('/auth/me', userData);
      localStorage.setItem(STUDENT_USER_KEY, JSON.stringify(response.data));
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get stored auth token
   * @returns {string|null} Auth token or null
   */
  getToken: () => getStoredToken(),

  /**
   * Get stored user data
   * @returns {Object|null} User object or null
   */
  getUser: () => {
    const user = localStorage.getItem(STUDENT_USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get user role
   * @returns {string|null} User role or null
   */
  getUserRole: () => localStorage.getItem(STUDENT_USER_ROLE_KEY) || localStorage.getItem(LEGACY_USER_ROLE_KEY),

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => !!getStoredToken(),

  /**
   * Check if user is a student
   * @returns {boolean} True if user is a student
   */
  isStudent: () => (localStorage.getItem(STUDENT_USER_ROLE_KEY) || localStorage.getItem(LEGACY_USER_ROLE_KEY)) === 'student',

  /**
   * Check if user is a counselor or psychiatrist
   * @returns {boolean} True if user is a counselor or psychiatrist
   */
  isCounselor: () => {
    const role = localStorage.getItem(STUDENT_USER_ROLE_KEY) || localStorage.getItem(LEGACY_USER_ROLE_KEY);
    return role === 'counselor' || role === 'psychiatrist';
  },

  /**
   * Check if user is an administrator
   * @returns {boolean} True if user is an administrator
   */
  isAdmin: () => (localStorage.getItem(STUDENT_USER_ROLE_KEY) || localStorage.getItem(LEGACY_USER_ROLE_KEY)) === 'admin',
};

export default authService;
