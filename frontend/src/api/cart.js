// frontend/src/api/cart.js
import apiClient from './client';

export async function getCart() {
  const response = await apiClient.get('/cart/user');
  return response.data;
}

export async function addToCart(voucherId, quantity = 1) {
  const response = await apiClient.post('/cart', { voucher: voucherId, quantity });
  return response.data;
}

export async function updateCartQuantity(itemId, quantity) {
  const response = await apiClient.patch(`/cart/${itemId}`, { quantity });
  return response.data;
}

export async function deleteFromCart(itemId) {
  const response = await apiClient.delete(`/cart/${itemId}`);
  return response.data;
}

export async function redeemCart() {
  try {
    const response = await apiClient.post('/cart/redeem');
    return response.data;
  } catch (error) {
    const serverMessage = error.response?.data?.message;
    throw new Error(serverMessage || `Redemption failed with status ${error.response?.status}`);
  }
}

// Used for single voucher redeem in VoucherDetail and VoucherCategory
export async function redeemSingleVoucher(voucherId) {
  try {
    const response = await apiClient.post('/cart/redeem-single', { voucherId });
    return response.data;
  } catch (error) {
    const serverMessage = error.response?.data?.message;
    throw new Error(serverMessage || `Redemption failed with status ${error.response?.status}`);
  }
}