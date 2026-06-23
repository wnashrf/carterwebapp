// frontend/src/api/categories.js
import apiClient from './client';

export async function fetchCategories() {
  const response = await apiClient.get('/categories');
  return response.data;
}