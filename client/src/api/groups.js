import api from './axios';

// ── fetch every group the logged-in user belongs to ──
// used on the dashboard to populate the group list
export const fetchUserGroups = async () => {
  const response = await api.get('/groups');
  return response.data; // { groups: [...] }
};

// ── fetch one group's details + member list ──
// used on the group page header
export const fetchGroup = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data; // { group: {...}, members: [...] }
};

// ── create a new group ──
// body shape: { name, description, currency }
export const createGroup = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data; // { group: {...} }
};

// ── invite someone to a group by email ──
export const addMember = async (groupId, email) => {
  const response = await api.post(`/groups/${groupId}/members`, { email });
  return response.data;
};

// ── update group details ──
export const editGroup = async (groupId, groupData) => {
  const response = await api.patch(`/groups/${groupId}`, groupData);
  return response.data;
};

// ── delete a group ──
export const deleteGroup = async (groupId) => {
  const response = await api.delete(`/groups/${groupId}`);
  return response.data;
};

// ── remove a member from a group or leave the group yourself ──
export const removeMember = async (groupId, userId) => {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
};

// ── get the balance summary for a group ──
// returns who owes whom + the minimal settlement list
export const fetchBalances = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/balances`);
  return response.data; // { balances: [...], settlements: [...], isSettled: bool }
};

// ── record that a debt has been paid ──
export const recordSettlement = async (groupId, toUserId, amount) => {
  const response = await api.post(`/groups/${groupId}/settle`, { toUserId, amount });
  return response.data;
};