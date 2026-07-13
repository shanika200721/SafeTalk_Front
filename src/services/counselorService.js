import api from './api';

/**
 * Counselor Service - Handles all API calls for counselor dashboard
 * Connects to backend endpoints in: backend/app/routes/counselor.py
 */

const counselorService = {
  /**
   * GET ALERTS
   * Fetches high-risk alerts for the counselor
   * @param {Object} options - Filter options (unread_only, limit, offset)
   * @returns {Promise} List of alerts
   */
  getAlerts: async (options = {}) => {
    try {
      const params = new URLSearchParams(options);
      const response = await api.get(`/api/counselor/alerts?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  /**
   * MARK ALERT AS READ
   * Updates alert read status
   * @param {number} alertId - ID of the alert
   * @returns {Promise} Updated alert
   */
  markAlertAsRead: async (alertId) => {
    try {
      const response = await api.put(`/api/counselor/alerts/${alertId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  },

  /**
   * GET HIGH-RISK USERS
   * Fetches list of students at risk
   * @param {Object} options - Filter options (risk_level, limit, offset)
   * @returns {Promise} List of high-risk users
   */
  getHighRiskUsers: async (options = {}) => {
    try {
      const params = new URLSearchParams(options);
      const response = await api.get(`/api/counselor/high-risk-users?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching high-risk users:', error);
      throw error;
    }
  },

  /**
   * GET STUDENT DASHBOARD
   * Fetches comprehensive dashboard data for a single student
   * Includes: profile, assessments, check-ins, risk data, alerts
   * @param {number} userId - Student's user ID
   * @returns {Promise} Complete student dashboard data
   */
  getStudentDashboard: async (userId) => {
    try {
      const response = await api.get(`/api/counselor/student/${userId}/dashboard`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student dashboard for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * CREATE COUNSELOR SESSION
   * Creates a new session between counselor and student
   * @param {Object} sessionData - { user_id, session_type, risk_level_at_escalation, counselor_notes }
   * @returns {Promise} Created session object
   */
  createSession: async (sessionData) => {
    try {
      const response = await api.post('/api/counselor/sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating counselor session:', error);
      throw error;
    }
  },

  /**
   * GET SESSION DETAILS
   * Fetches full details of a specific counselor session
   * @param {number} sessionId - ID of the session
   * @returns {Promise} Session details
   */
  getSessionDetails: async (sessionId) => {
    try {
      const response = await api.get(`/api/counselor/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * UPDATE COUNSELOR SESSION
   * Updates session status, notes, intervention, outcome, follow-up
   * @param {number} sessionId - ID of the session
   * @param {Object} updateData - Fields to update
   * @returns {Promise} Updated session object
   */
  updateSession: async (sessionId, updateData) => {
    try {
      const response = await api.put(`/api/counselor/sessions/${sessionId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * GET STUDENT SESSIONS
   * Fetches all counselor sessions for a specific student
   * @param {number} userId - Student's user ID
   * @returns {Promise} List of sessions for the student
   */
  getStudentSessions: async (userId) => {
    try {
      const response = await api.get(`/api/counselor/sessions/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * GET ANALYTICS SUMMARY
   * Fetches analytics data for 30 days (or custom period)
   * @param {Object} options - { days (default 30) }
   * @returns {Promise} Analytics data
   */
  getAnalyticsSummary: async (options = { days: 30 }) => {
    try {
      const params = new URLSearchParams(options);
      const response = await api.get(`/api/counselor/analytics/summary?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  },

  // ==================== ADVANCED STUDENT MANAGEMENT ====================

  /**
   * GET ALL STUDENTS
   * Fetches all students in the system with pagination
   * @param {Object} options - { search, risk_level, page, limit }
   * @returns {Promise} List of all students
   */
  getAllStudents: async (options = {}) => {
    try {
      const params = new URLSearchParams(options);
      const response = await api.get(`/api/counselor/students?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all students:', error);
      throw error;
    }
  },

  /**
   * GET STUDENT DAILY CHECK-INS
   * Fetches daily check-in history for a student
   * @param {number} userId - Student's user ID
   * @param {number} days - Number of days to fetch (default 30)
   * @returns {Promise} List of daily check-ins
   */
  getStudentDailyCheckIns: async (userId, days = 30) => {
    try {
      const response = await api.get(`/api/student/${userId}/daily-checkins?days=${days}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching daily check-ins for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * GET DASS21 HISTORY
   * Fetches DASS21 scores history and monthly averages
   * @param {number} userId - Student's user ID
   * @param {number} days - Number of days to fetch (default 30)
   * @returns {Promise} DASS21 history and averages
   */
  getStudentDASSHistory: async (userId, days = 30) => {
    try {
      const response = await api.get(`/api/student/${userId}/dass21-history?days=${days}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching DASS21 history for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * GET DASS21 AVERAGE
   * Calculates DASS21 average for a period
   * @param {number} userId - Student's user ID
   * @param {number} days - Period in days (default 30)
   * @returns {Promise} Average DASS21 scores and metrics
   */
  getStudentDASSAverage: async (userId, days = 30) => {
    try {
      const response = await api.get(`/api/student/${userId}/dass21-average?days=${days}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching DASS21 average for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * GET CHATBOT SUMMARY
   * Analyzes chatbot conversations and detects risk
   * @param {number} userId - Student's user ID
   * @param {number} days - Number of days of conversations to analyze (default 30)
   * @returns {Promise} Risk analysis from chatbot conversations
   */
  getStudentChatbotSummary: async (userId, days = 30) => {
    try {
      const response = await api.get(`/api/student/${userId}/chatbot-summary?days=${days}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chatbot summary for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * GET RISK ANALYSIS
   * Gets section-wise risk scores breakdown
   * @param {number} userId - Student's user ID
   * @returns {Promise} Risk analysis with section scores
   */
  getStudentRiskAnalysis: async (userId) => {
    try {
      const response = await api.get(`/api/student/${userId}/risk-analysis`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching risk analysis for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * GET STUDENT CHAT MESSAGES
   * Fetches chat history between counselor and student
   * @param {number} userId - Student's user ID
   * @param {number} page - Page number (default 0)
   * @param {number} limit - Messages per page (default 50)
   * @returns {Promise} Chat message history
   */
  getStudentChatMessages: async (userId, page = 0, limit = 50) => {
    try {
      const response = await api.get(`/api/chat/${userId}/messages?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chat messages for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * GET STUDENT COMPLETE PROFILE
   * Fetches all student data for profile view
   * @param {number} userId - Student's user ID
   * @returns {Promise} Complete student profile data
   */
  getStudentCompleteProfile: async (userId) => {
    try {
      const response = await api.get(`/api/student/${userId}/profile-complete`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching complete profile for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * GENERATE ANALYSIS REPORT
   * Generates AI-powered analysis report for a student
   * @param {number} userId - Student's user ID
   * @returns {Promise} Generated report
   */
  generateStudentAnalysisReport: async (userId) => {
    try {
      const response = await api.post(`/api/reports/generate`, { user_id: userId });
      return response.data;
    } catch (error) {
      console.error(`Error generating analysis report for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * GET LATEST REPORT
   * Fetches the latest generated report for a student
   * @param {number} userId - Student's user ID
   * @returns {Promise} Latest report
   */
  getLatestReport: async (userId) => {
    try {
      const response = await api.get(`/api/reports/${userId}/latest`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching latest report for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * SEND MESSAGE TO STUDENT
   * Sends a message from counselor to student
   * @param {number} userId - Student's user ID
   * @param {string} message - Message content
   * @returns {Promise} Sent message confirmation
   */
  sendStudentMessage: async (userId, message) => {
    try {
      const response = await api.post(`/api/chat/${userId}/message`, { message });
      return response.data;
    } catch (error) {
      console.error(`Error sending message to user ${userId}:`, error);
      throw error;
    }
  },
};

export default counselorService;
