// frontend/src/api/auth.js
import apiClient from './client';

export async function loginUser(email, password) {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}

export async function signupUser(username, email, password) {
  const response = await apiClient.post('/auth/signup', { username, email, password });
  return response.data;
}

export const fetchProfileData = () => apiClient.get('/auth/profile');
export const modifyProfileData = (payload) => apiClient.put('/auth/profile', payload);