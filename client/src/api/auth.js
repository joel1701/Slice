import api from './axios';

// ── REGISTER ──────────────────────────────────────────────────────────────────
// sends name, email, password to backend
// returns { token, user } on success
export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// sends email and password to backend
// returns { token, user } on success
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// ── GET CURRENT USER ──────────────────────────────────────────────────────────
// calls the protected /me endpoint to get fresh user data
// useful to verify the stored token is still valid on app load
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};