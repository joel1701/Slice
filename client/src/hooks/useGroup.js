import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGroup, fetchBalances, addMember, editGroup, deleteGroup, removeMember } from '../api/groups';
import { fetchExpenses } from '../api/expenses';
import toast from 'react-hot-toast';

// ── useGroup ───────────────────────────────────────────────────────────────────
// Encapsulates all data fetching and mutation logic for the group page
// GroupPage.jsx calls this hook and gets back clean state + actions
// This separation means GroupPage only thinks about rendering, not data
const useGroup = (groupId) => {
  const navigate = useNavigate();

  // ── state ──────────────────────────────────────────────────────────────────
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // subtle refresh indicator

  // ── initial load ───────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      // fire all three requests simultaneously — faster than sequential
      const [groupRes, expenseRes, balanceRes] = await Promise.all([
        fetchGroup(groupId),
        fetchExpenses(groupId),
        fetchBalances(groupId),
      ]);

      setGroup(groupRes.group);
      setMembers(groupRes.members);
      setExpenses(expenseRes.expenses);
      setBalanceData(balanceRes);
    } catch (error) {
      console.error('Failed to load group data:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        toast.error('Group not found or access denied');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load group. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── refresh expenses + balances after any mutation ─────────────────────────
  // we don't re-fetch group/members since those rarely change
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [expenseRes, balanceRes] = await Promise.all([
        fetchExpenses(groupId),
        fetchBalances(groupId),
      ]);
      setExpenses(expenseRes.expenses);
      setBalanceData(balanceRes);
    } catch (error) {
      console.error('Failed to refresh:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [groupId]);

  // ── invite a member ────────────────────────────────────────────────────────
  const inviteMember = useCallback(async (email) => {
    try {
      await addMember(groupId, email);
      toast.success(`${email} added to the group`);
      // re-fetch just the group to update member list
      const groupRes = await fetchGroup(groupId);
      setMembers(groupRes.members);
      return true; // signal success to the caller so it can reset the form
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add member';
      toast.error(message);
      return false;
    }
  }, [groupId]);

  const updateGroup = useCallback(async (updates) => {
    try {
      await editGroup(groupId, updates);
      toast.success('Group updated');
      const groupRes = await fetchGroup(groupId);
      setGroup(groupRes.group);
      setMembers(groupRes.members);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update group';
      toast.error(message);
      return false;
    }
  }, [groupId]);

  const deleteCurrentGroup = useCallback(async () => {
    try {
      await deleteGroup(groupId);
      toast.success('Group deleted');
      navigate('/dashboard');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete group';
      toast.error(message);
      return false;
    }
  }, [groupId, navigate]);

  const removeGroupMember = useCallback(async (userId) => {
    try {
      await removeMember(groupId, userId);
      toast.success('Member removed');
      const groupRes = await fetchGroup(groupId);
      setMembers(groupRes.members);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove member';
      toast.error(message);
      return false;
    }
  }, [groupId]);

  // return everything the component needs — state and action functions
  return {
    group,
    members,
    expenses,
    balanceData,
    loading,
    refreshing,
    refresh,
    inviteMember,
    updateGroup,
    deleteCurrentGroup,
    removeGroupMember,
  };
};

export default useGroup;