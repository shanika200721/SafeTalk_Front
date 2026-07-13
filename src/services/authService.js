import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
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
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('user_role', response.data.user.role);
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
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('user_role', response.data.user.role);
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
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('user_role', response.data.user.role);
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
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
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get stored auth token
   * @returns {string|null} Auth token or null
   */
  getToken: () => localStorage.getItem('access_token'),

  /**
   * Get stored user data
   * @returns {Object|null} User object or null
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get user role
   * @returns {string|null} User role or null
   */
  getUserRole: () => localStorage.getItem('user_role'),

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => !!localStorage.getItem('access_token'),

  /**
   * Check if user is a student
   * @returns {boolean} True if user is a student
   */
  isStudent: () => localStorage.getItem('user_role') === 'student',

  /**
   * Check if user is a counselor
   * @returns {boolean} True if user is a counselor or admin
   */
  isCounselor: () => {
    const role = localStorage.getItem('user_role');
    return role === 'counselor' || role === 'admin' || role === 'psychiatrist';
  },
};

export default authService;
