import api from './api';

const queryString = (options = {}) => {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

const counselorService = {
  getDashboard: async (options = {}) => {
    const response = await api.get(`/api/counselor/dashboard${queryString(options)}`);
    return response.data;
  },

  getAllStudents: async (options = {}) => {
    const response = await api.get(`/api/counselor/students${queryString(options)}`);
    return response.data;
  },

  getStudent: async (studentId) => {
    const response = await api.get(`/api/counselor/student/${studentId}`);
    return response.data;
  },

  getStudentDashboard: async (studentId) => {
    const response = await api.get(`/api/counselor/student/${studentId}/dashboard`);
    return response.data;
  },

  getStudentTimeline: async (studentId) => {
    const response = await api.get(`/api/counselor/student/${studentId}/timeline`);
    return response.data;
  },

  getStudentReport: async (studentId) => {
    const response = await api.get(`/api/counselor/student/${studentId}/reports`);
    return response.data;
  },

  downloadStudentReport: async (studentId, format = 'pdf') => {
    const response = await api.get(`/api/counselor/student/${studentId}/reports${queryString({ format })}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: format === 'csv' ? 'text/csv' : 'application/pdf',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_${studentId}_report.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  createReview: async (payload) => {
    const response = await api.post('/api/counselor/reviews', payload);
    return response.data;
  },

  updateReview: async (reviewId, payload) => {
    const response = await api.patch(`/api/counselor/reviews/${reviewId}`, payload);
    return response.data;
  },

  createNote: async (payload) => {
    const response = await api.post('/api/counselor/notes', payload);
    return response.data;
  },

  updateNote: async (noteId, payload) => {
    const response = await api.patch(`/api/counselor/notes/${noteId}`, payload);
    return response.data;
  },

  getAlerts: async (options = {}) => {
    const response = await api.get(`/api/counselor/alerts${queryString(options)}`);
    return response.data;
  },

  markAlertAsRead: async (alertId) => {
    const response = await api.put(`/api/counselor/alerts/${alertId}/read`);
    return response.data;
  },

  getHighRiskUsers: async (options = {}) => {
    const response = await api.get(`/api/counselor/high-risk-users${queryString(options)}`);
    return response.data;
  },

  getAnalyticsSummary: async (options = { days: 30 }) => {
    const response = await api.get(`/api/counselor/analytics/summary${queryString(options)}`);
    return response.data;
  },

  createSession: async (payload) => {
    const response = await api.post('/api/counselor/sessions', payload);
    return response.data;
  },

  getSessionDetails: async (sessionId) => {
    const response = await api.get(`/api/counselor/sessions/${sessionId}`);
    return response.data;
  },

  updateSession: async (sessionId, payload) => {
    const response = await api.put(`/api/counselor/sessions/${sessionId}`, payload);
    return response.data;
  },

  getStudentSessions: async (studentId) => {
    const response = await api.get(`/api/counselor/sessions/user/${studentId}`);
    return response.data;
  },
};

export default counselorService;
