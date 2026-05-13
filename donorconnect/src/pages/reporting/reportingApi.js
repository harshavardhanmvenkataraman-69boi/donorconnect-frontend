// All API calls for the reporting service
// Gateway: /api/reports/** → reporting-service /api/v1/reports/**
import api from '../../api/axiosInstance';

const BASE = '/api/reports';

export const reportingApi = {
  inventorySnapshot : () => api.get(`${BASE}/inventory-snapshot`),
  expiryRisk        : () => api.get(`${BASE}/expiry-risk`),
  donorActivity     : () => api.get(`${BASE}/donor-activity`),
  donationFrequency : () => api.get(`${BASE}/donation-frequency`),
  componentWastage  : () => api.get(`${BASE}/component-wastage`),
  reactiveCount     : () => api.get(`${BASE}/reactive-count`),
  deferrals         : () => api.get(`${BASE}/deferrals`),
  tat               : () => api.get(`${BASE}/tat`),
  utilization       : () => api.get(`${BASE}/utilization`),
  adverseReactions  : () => api.get(`${BASE}/adverse-reactions`),
  getAllPacks        : (page = 0, size = 20) => api.get(`${BASE}?page=${page}&size=${size}`),
  getPackById       : (id) => api.get(`${BASE}/${id}`),
  generate          : (scope = 'SITE') => api.post(`${BASE}/generate?scope=${scope}`),
  downloadCsv       : (type) => api.get(`${BASE}/download/${type}/csv`, { responseType: 'blob' }),
  downloadExcel     : () => api.get(`${BASE}/download/full-report/excel`, { responseType: 'blob' }),
};

// Unwrap standard ApiResponse wrapper
export const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
