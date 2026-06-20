const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getCart() {
  const response = await fetch(`${API}/cart/user`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch cart: ${response.status}`);
  }
  return response.json();
}

export async function addToCart(voucherId, quantity = 1) {
  const response = await fetch(`${API}/cart`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ voucher: voucherId, quantity }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add to cart: ${response.status}`);
  }
  return response.json();
}

export async function updateCartQuantity(itemId, quantity) {
  const response = await fetch(`${API}/cart/${itemId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update quantity: ${response.status}`);
  }
  return response.json();
}

export async function deleteFromCart(itemId) {
  const response = await fetch(`${API}/cart/${itemId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete from cart: ${response.status}`);
  }
  return response.json();
}

export async function redeemCart() {
  const response = await fetch(`${API}/cart/redeem`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Redemption failed with status ${response.status}`);
  }
  return response.json();
}
