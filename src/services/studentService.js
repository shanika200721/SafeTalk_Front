/**
 * Student Service - API calls for student endpoints
 * Handles all student-specific API communication
 */

import api from './api';

const studentService = {
  /**
   * Get student dashboard data
   * Returns comprehensive data for student dashboard
   */
  getDashboard: async () => {
    try {
      const response = await api.get('/api/student/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student dashboard:', error);
      throw error;
    }
  },

  /**
   * Get student statistics
   * Returns streaks, check-in counts, averages
   */
  getStats: async () => {
    try {
      const response = await api.get('/api/student/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student stats:', error);
      throw error;
    }
  },

  /**
   * Get recommended resources
   * Crisis hotlines, coping strategies, support groups
   */
  getResources: async () => {
    try {
      const response = await api.get('/api/student/resources');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student resources:', error);
      throw error;
    }
  },

  /**
   * Get available counselors
   * List of counselors the student can reach out to
   */
  getCounselors: async () => {
    try {
      const response = await api.get('/api/student/counselors');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
      throw error;
    }
  },

  /**
   * Submit daily check-in
   */
  submitDailyCheckin: async (checkinData) => {
    try {
      const response = await api.post('/api/checkin/daily', checkinData);
      return response.data;
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      throw error;
    }
  },

  /**
   * Submit profile assessment
   */
  submitProfileAssessment: async (assessmentData) => {
    try {
      const response = await api.post('/api/assessments/profile', assessmentData);
      return response.data;
    } catch (error) {
      console.error('Failed to submit profile assessment:', error);
      throw error;
    }
  },

  getProfileAssessmentQuestions: async () => {
    const response = await api.get('/api/student/profile-assessment/questions');
    return response.data;
  },

  getProfileAssessmentStatus: async () => {
    const response = await api.get('/api/student/profile-assessment/status');
    return response.data;
  },

  getCurrentProfileAssessment: async () => {
    const response = await api.get('/api/student/profile-assessment/current');
    return response.data;
  },

  saveProfileAssessmentDraft: async (payload) => {
    const response = await api.post('/api/student/profile-assessment/draft', payload);
    return response.data;
  },

  submitProfileAssessmentV2: async (payload) => {
    const response = await api.post('/api/student/profile-assessment/submit', payload);
    return response.data;
  },

  getProfileAssessmentSummary: async (assessmentId) => {
    const response = await api.get(`/api/student/profile-assessment/${assessmentId}/summary`);
    return response.data;
  },

  getFacialAnalysisStatus: async () => {
    const response = await api.get('/api/student/facial-analysis/status');
    return response.data;
  },

  /**
   * Submit DASS21 assessment
   */
  submitDASS21: async (das21Data) => {
    try {
      const response = await api.post('/api/assessments/dass21', das21Data);
      return response.data;
    } catch (error) {
      console.error('Failed to submit DASS21:', error);
      throw error;
    }
  },

  /**
   * Get completed assessments
   */
  getAssessments: async () => {
    try {
      const response = await api.get('/api/assessments');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      throw error;
    }
  },

  /**
   * Get check-in history
   */
  getCheckinHistory: async (days = 30) => {
    try {
      const response = await api.get(`/api/checkin/history?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch check-in history:', error);
      throw error;
    }
  },
};

export default studentService;
