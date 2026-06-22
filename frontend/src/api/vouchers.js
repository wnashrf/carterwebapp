// frontend/src/api/vouchers.js
import apiClient from './client';

export async function getVouchers() {
  const response = await apiClient.get('/vouchers');
  return response.data;
}

export async function getVoucherDetails(id) {
  const response = await apiClient.get(`/vouchers/${id}`);
  return response.data;
}