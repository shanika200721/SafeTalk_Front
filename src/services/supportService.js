import api from './api';

const supportService = {
  getContact: async () => {
    const response = await api.get('/api/support/contact');
    return response.data;
  },

  getUniversity: async () => {
    const response = await api.get('/api/support/university');
    return response.data;
  },

  recordAction: async (actionType, contactType) => {
    const response = await api.post('/api/support/actions', {
      action_type: actionType,
      contact_type: contactType,
    });
    return response.data;
  },
};

export default supportService;
