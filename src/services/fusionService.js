import api from './api'

const fusionService = {
  getLatest: async () => {
    const response = await api.get('/api/fusion/assessments/latest')
    return response.data
  },

  assessSelf: async () => {
    const response = await api.post('/api/fusion/assess', {})
    return response.data
  },

  getConfig: async () => {
    const response = await api.get('/api/fusion/config')
    return response.data
  },
}

export default fusionService
