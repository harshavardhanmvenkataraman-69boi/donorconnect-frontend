import { jwtDecode } from 'jwt-decode';
import api from './axiosInstance';

export const getToken = () => localStorage.getItem('token');

export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  try { return jwtDecode(token); }
  catch { return null; }
};

export const getRole = () => {
  const user = getCurrentUser();
  // JWT has 'role' (string) and 'roles' (array) — backend sets both
  return user?.role || user?.roles?.[0] || user?.authorities?.[0] || null;
};

export const getUserId = () => {
  const user = getCurrentUser();
  // Backend sets 'userId' claim as a string
  return user?.userId || user?.sub || null;
};

export const getUserName = () => {
  return localStorage.getItem('userName') || getCurrentUser()?.sub || 'User';
};

export const isLoggedIn = () => !!getToken();

export const logout = async () => {
  try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.href = '/login';
};
