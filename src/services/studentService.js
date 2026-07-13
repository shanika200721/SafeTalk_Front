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
      console.log('Fetching student dashboard...');
      const response = await api.get('/api/student/dashboard');
      console.log('Student dashboard data:', response.data);
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
      console.log('Fetching student stats...');
      const response = await api.get('/api/student/stats');
      console.log('Student stats:', response.data);
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
      console.log('Fetching student resources...');
      const response = await api.get('/api/student/resources');
      console.log('Student resources:', response.data);
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
      console.log('Fetching available counselors...');
      const response = await api.get('/api/student/counselors');
      console.log('Available counselors:', response.data);
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
      console.log('Submitting daily check-in:', checkinData);
      const response = await api.post('/api/checkin/daily', checkinData);
      console.log('Check-in submitted:', response.data);
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
      console.log('Submitting profile assessment:', assessmentData);
      const response = await api.post('/api/assessments/profile', assessmentData);
      console.log('Profile assessment submitted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to submit profile assessment:', error);
      throw error;
    }
  },

  /**
   * Submit DASS21 assessment
   */
  submitDASS21: async (das21Data) => {
    try {
      console.log('Submitting DASS21 assessment:', das21Data);
      const response = await api.post('/api/assessments/dass21', das21Data);
      console.log('DASS21 assessment submitted:', response.data);
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
