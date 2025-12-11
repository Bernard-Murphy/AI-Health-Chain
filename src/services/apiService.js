import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Patients
  getPatients: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/patients', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getPatient: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  getPatientRecords: async (patientId) => {
    const response = await api.get(`/patients/${patientId}/records`);
    return response.data;
  },

  // Consents
  getConsents: async (patientId = null, status = null) => {
    const params = {};
    if (patientId) params.patientId = patientId;
    if (status) params.status = status;
    
    const response = await api.get('/consents', { params });
    return response.data;
  },

  getConsent: async (id) => {
    const response = await api.get(`/consents/${id}`);
    return response.data;
  },

  createConsent: async (consentData) => {
    const response = await api.post('/consents', consentData);
    return response.data;
  },

  updateConsent: async (id, updates) => {
    const response = await api.patch(`/consents/${id}`, updates);
    return response.data;
  },

  // Transactions
  getTransactions: async (walletAddress = null, limit = 20) => {
    const params = { limit };
    if (walletAddress) params.walletAddress = walletAddress;
    
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // Signature verification
  verifySignature: async (message, signature, address) => {
    const response = await api.post('/verify-signature', {
      message,
      signature,
      address,
    });
    return response.data;
  },

  // Statistics
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
};


