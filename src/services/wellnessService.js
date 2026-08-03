import api from './api';

const wellnessService = {
  getWellness: async () => (await api.get('/api/student/wellness')).data,
  getResources: async (params = {}) => (await api.get('/api/student/resources', { params })).data,
  favoriteResource: async (id, favorite) => (await api.post(`/api/student/resources/${id}/favorite`, { favorite })).data,
  viewResource: async (id) => (await api.post(`/api/student/resources/${id}/view`)).data,
  getVideos: async (params = {}) => (await api.get('/api/student/videos', { params })).data,
  favoriteVideo: async (id, favorite) => (await api.post(`/api/student/videos/${id}/favorite`, { favorite })).data,
  completeVideo: async (id, completed) => (await api.post(`/api/student/videos/${id}/complete`, { completed })).data,
  getBreathing: async () => (await api.get('/api/student/breathing')).data,
  recordBreathing: async (payload) => (await api.post('/api/student/breathing/session', payload)).data,
  getMeditation: async (params = {}) => (await api.get('/api/student/meditation', { params })).data,
  favoriteMeditation: async (id, favorite) => (await api.post(`/api/student/meditation/${id}/favorite`, { favorite })).data,
  completeMeditation: async (id, completed) => (await api.post(`/api/student/meditation/${id}/complete`, { completed })).data,
  getAmbientSounds: async () => (await api.get('/api/student/ambient-sounds')).data,
  getActivities: async () => (await api.get('/api/student/activities')).data,
  getJournal: async (params = {}) => (await api.get('/api/student/journal', { params })).data,
  createJournal: async (payload) => (await api.post('/api/student/journal', payload)).data,
  exportJournal: async () => (await api.get('/api/student/journal/export')).data,
  getProgress: async () => (await api.get('/api/student/progress')).data,
  trackProgress: async (payload) => (await api.post('/api/student/progress/track', payload)).data,
  getPreferences: async () => (await api.get('/api/student/preferences')).data,
  updatePreferences: async (payload) => (await api.patch('/api/student/preferences', payload)).data,
};

export default wellnessService;
