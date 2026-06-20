const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

export async function getVouchers() {
  const response = await fetch(`${API}/vouchers`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
