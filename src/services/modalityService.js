import api from './api';

export const getModalityAvailability = async () => {
  const response = await api.get('/api/modalities/availability');
  return response.data;
};

export const getLatestModalityPredictions = async () => {
  const response = await api.get('/api/modalities/predictions/latest');
  return response.data;
};

export const getModalityPredictions = async (params = {}) => {
  const response = await api.get('/api/modalities/predictions', { params });
  return response.data;
};

export const predictProfile = async (payload = {}) => {
  const response = await api.post('/api/modalities/profile/predict', payload);
  return response.data;
};

export const predictDASS21 = async (payload = {}) => {
  const response = await api.post('/api/modalities/dass21/predict', payload);
  return response.data;
};

export const predictMood = async (payload = {}) => {
  const response = await api.post('/api/modalities/mood/predict', payload);
  return response.data;
};

export const predictText = async (payload) => {
  const response = await api.post('/api/modalities/text/predict', payload);
  return response.data;
};

export const predictSpeech = async (payload = {}) => {
  const response = await api.post('/api/modalities/speech/predict', payload);
  return response.data;
};

export const predictFace = async (payload = {}) => {
  const response = await api.post('/api/modalities/face/predict', payload);
  return response.data;
};

export const predictBehavioral = async (payload = {}) => {
  const response = await api.post('/api/modalities/behavioral/predict', payload);
  return response.data;
};

export const recordBehavioralTelemetry = async (payload = {}) => {
  const response = await api.post('/api/modalities/behavioral/telemetry', payload);
  return response.data;
};
