import api from './axios';

// ── fetch all expenses in a group (paginated) ──
// page defaults to 1 if not passed
export const fetchExpenses = async (groupId, page = 1) => {
  const response = await api.get(`/groups/${groupId}/expenses?page=${page}&limit=10`);
  return response.data; // { expenses: [...], pagination: {...} }
};

// ── add a new expense to a group ──
// body shape: { description, amount, category, date, paidBy }
export const addExpense = async (groupId, expenseData) => {
  const response = await api.post(`/groups/${groupId}/expenses`, expenseData);
  return response.data;
};

// ── delete an expense ──
// only works if the logged-in user is the one who paid
export const deleteExpense = async (expenseId) => {
  const response = await api.delete(`/expenses/${expenseId}`);
  return response.data;
};