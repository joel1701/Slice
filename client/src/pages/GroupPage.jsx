import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useGroup from '../hooks/useGroup';

import Navbar from '../components/Navbar';
import ExpenseList from '../components/ExpenseList';
import BalanceCard from '../components/BalanceCard';
import AddExpenseModal from '../components/AddExpenseModal';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const GroupPage = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // all data and mutations come from the hook — component just renders
  const {
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
  } = useGroup(groupId);

  // ── local UI state — these don't need to be in the hook ──
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCurrency, setEditCurrency] = useState('INR');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [memberActionLoading, setMemberActionLoading] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    const success = await inviteMember(inviteEmail.trim());
    setInviteLoading(false);
    if (success) {
      setInviteEmail('');
      setShowInvite(false);
    }
  };

  const currentMembership = members.find((m) => m.userId?._id === user?.id);
  const isAdmin = currentMembership?.role === 'admin';

  const openEditGroup = () => {
    setEditName(group.name || '');
    setEditDescription(group.description || '');
    setEditCurrency(group.currency || 'INR');
    setShowEditGroup(true);
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setEditLoading(true);
    const success = await updateGroup({
      name: editName.trim(),
      description: editDescription.trim(),
      currency: editCurrency,
    });
    setEditLoading(false);
    if (success) setShowEditGroup(false);
  };

  const handleDeleteGroup = async () => {
    setDeleteLoading(true);
    const success = await deleteCurrentGroup();
    setDeleteLoading(false);
    if (success) setShowDeleteConfirm(false);
  };

  const handleRemoveMember = async (member) => {
    const targetId = member.userId?._id;
    if (!targetId) return;
    const isSelf = targetId === user?.id;
    const label = isSelf ? 'leave the group' : `remove ${member.userId?.name || 'this member'}`;
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;

    setMemberActionLoading(targetId);
    const success = await removeGroupMember(targetId);
    setMemberActionLoading('');
    if (success && isSelf) navigate('/dashboard');
  };

  // ── full-page loading state ──
  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.center}>
          <Spinner size={40} />
          <p style={styles.loadingText}>Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) return null;

  const hasUnsettledDebts = balanceData && !balanceData.isSettled;

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        {/* ── back + title + add button ── */}
        <div style={styles.topRow}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            ← Back
          </button>
          <div style={styles.topActions}>
            {isAdmin && (
              <>
                <button onClick={openEditGroup} style={styles.secondaryBtn}>
                  Edit group
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} style={styles.dangerBtn}>
                  Delete group
                </button>
              </>
            )}
            <button onClick={() => setShowAddExpense(true)} style={styles.addBtn}>
              + Add expense
            </button>
          </div>
        </div>

        <div style={styles.groupInfo}>
          <h1 style={styles.groupName}>{group.name}</h1>
          {group.description && (
            <p style={styles.groupDesc}>{group.description}</p>
          )}
          <span style={styles.currencyBadge}>{group.currency}</span>
        </div>

        {/* ── members strip ── */}
        <div style={styles.membersStrip}>
          <div style={styles.avatarCluster}>
            {members.slice(0, 7).map((m) => (
              <div
                key={m._id}
                title={m.userId?.name}
                style={styles.miniAvatar}
              >
                {m.userId?.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            {members.length > 7 && (
              <div style={{ ...styles.miniAvatar, background: '#e5e7eb', color: '#6b7280' }}>
                +{members.length - 7}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            style={styles.inviteBtn}
          >
            + Invite member
          </button>
        </div>

        {/* ── invite form ── */}
        {showInvite && (
          <form onSubmit={handleInvite} style={styles.inviteForm}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter their email address"
              style={styles.inviteInput}
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={inviteLoading}
              style={{ ...styles.inviteSubmit, opacity: inviteLoading ? 0.7 : 1 }}
            >
              {inviteLoading ? <Spinner size={14} color="#fff" /> : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setShowInvite(false); setInviteEmail(''); }}
              style={styles.inviteCancel}
            >
              Cancel
            </button>
          </form>
        )}

        <div style={styles.membersSection}>
          <div style={styles.membersHeader}>
            <h2 style={styles.sectionTitle}>Members</h2>
            <span style={styles.memberCount}>{members.length}</span>
          </div>
          <div style={styles.memberList}>
            {members.map((member) => {
              const memberId = member.userId?._id;
              const isSelf = memberId === user?.id;
              const canRemove = isAdmin && (!isSelf || members.length > 1);

              return (
                <div key={member._id} style={styles.memberRow}>
                  <div style={styles.memberAvatar}>
                    {member.userId?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={styles.memberInfo}>
                    <div style={styles.memberNameRow}>
                      <span style={styles.memberName}>{member.userId?.name || 'Unknown'}</span>
                      {member.role === 'admin' && <span style={styles.adminBadge}>Admin</span>}
                      {isSelf && <span style={styles.selfBadge}>You</span>}
                    </div>
                    <span style={styles.memberEmail}>{member.userId?.email}</span>
                  </div>
                  {canRemove && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member)}
                      style={styles.removeBtn}
                      disabled={memberActionLoading === memberId}
                    >
                      {memberActionLoading === memberId ? 'Removing...' : isSelf ? 'Leave' : 'Remove'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── subtle refreshing indicator ── */}
        {refreshing && (
          <div style={styles.refreshBar}>
            <Spinner size={14} color="#4f46e5" />
            <span style={styles.refreshText}>Updating...</span>
          </div>
        )}

        {/* ── tabs ── */}
        <div style={styles.tabBar}>
          {['expenses', 'balances'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.tabBtnActive : {}),
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {/* red dot on balances tab if there are unsettled debts */}
              {tab === 'balances' && hasUnsettledDebts && (
                <span style={styles.unsettledDot} />
              )}
            </button>
          ))}
        </div>

        {/* ── tab content ── */}
        {activeTab === 'expenses' ? (
          expenses.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No expenses yet"
              subtitle="Add the first expense and it'll appear here"
              action={{ label: '+ Add expense', onClick: () => setShowAddExpense(true) }}
            />
          ) : (
            <ExpenseList
              expenses={expenses}
              currency={group.currency}
              onDeleted={refresh}
            />
          )
        ) : (
          // balances tab
          balanceData?.isSettled ? (
            <EmptyState
              icon="✓"
              title="All settled up!"
              subtitle="Nobody owes anyone anything in this group right now."
              variant="solid"
            />
          ) : (
            <div style={styles.settlementList}>
              {balanceData?.settlements?.map((s, i) => (
                <BalanceCard
                  key={i}
                  settlement={s}
                  groupId={groupId}
                  currency={group.currency}
                  onSettled={refresh}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* ── add expense modal ── */}
      {showAddExpense && (
        <AddExpenseModal
          groupId={groupId}
          members={members}
          onClose={() => setShowAddExpense(false)}
          onAdded={() => {
            setShowAddExpense(false);
            refresh();
            // switch to expenses tab so user sees the new entry immediately
            setActiveTab('expenses');
          }}
        />
      )}

      {showEditGroup && (
        <Modal onClose={() => setShowEditGroup(false)} title="Edit group" maxWidth={520}>
          <form onSubmit={handleEditGroup} style={styles.modalForm}>
            <label style={styles.fieldLabel}>
              Group name
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={styles.fieldInput}
                required
              />
            </label>
            <label style={styles.fieldLabel}>
              Description
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={styles.fieldTextarea}
                rows="4"
              />
            </label>
            <label style={styles.fieldLabel}>
              Currency
              <select
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
                style={styles.fieldInput}
              >
                {['INR', 'USD', 'EUR', 'GBP'].map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </label>
            <div style={styles.modalActions}>
              <button type="button" onClick={() => setShowEditGroup(false)} style={styles.secondaryBtn}>
                Cancel
              </button>
              <button type="submit" disabled={editLoading} style={styles.addBtn}>
                {editLoading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)} title="Delete group" maxWidth={460}>
          <div style={styles.confirmBody}>
            <p style={styles.confirmText}>
              This will permanently delete the group, all expenses, balances, and member data.
            </p>
            <div style={styles.modalActions}>
              <button type="button" onClick={() => setShowDeleteConfirm(false)} style={styles.secondaryBtn}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteGroup} disabled={deleteLoading} style={styles.dangerBtn}>
                {deleteLoading ? 'Deleting...' : 'Delete group'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f9fafb',
  },
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '1.5rem 1rem 4rem',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '5rem',
    gap: '12px',
  },
  loadingText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    gap: '12px',
    flexWrap: 'wrap',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },
  addBtn: {
    padding: '8px 16px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  secondaryBtn: {
    padding: '8px 14px',
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  dangerBtn: {
    padding: '8px 14px',
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  groupInfo: {
    marginBottom: '1.25rem',
  },
  groupName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px',
  },
  groupDesc: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 8px',
  },
  currencyBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  membersStrip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '8px',
  },
  avatarCluster: {
    display: 'flex',
  },
  miniAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#4f46e5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '600',
    border: '2px solid #f9fafb',
    marginRight: '-6px',
    flexShrink: 0,
  },
  inviteBtn: {
    padding: '6px 14px',
    fontSize: '13px',
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#374151',
    fontFamily: 'inherit',
  },
  inviteForm: {
    display: 'flex',
    gap: '8px',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  inviteInput: {
    flex: 1,
    minWidth: '200px',
    padding: '9px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#111827',
    background: '#fff',
  },
  inviteSubmit: {
    padding: '9px 16px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  inviteCancel: {
    padding: '9px 16px',
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#374151',
    fontFamily: 'inherit',
  },
  membersSection: {
    marginTop: '1rem',
    marginBottom: '1.25rem',
    padding: '1rem',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },
  membersHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.85rem',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    margin: 0,
    color: '#111827',
  },
  memberCount: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '3px 8px',
    borderRadius: '999px',
  },
  memberList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderTop: '1px solid #f3f4f6',
  },
  memberAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#111827',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    flexShrink: 0,
  },
  memberInfo: {
    minWidth: 0,
    flex: 1,
  },
  memberNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  memberName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  memberEmail: {
    display: 'block',
    marginTop: '2px',
    fontSize: '12px',
    color: '#6b7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  adminBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0f766e',
    background: '#ccfbf1',
    padding: '3px 8px',
    borderRadius: '999px',
  },
  selfBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1d4ed8',
    background: '#dbeafe',
    padding: '3px 8px',
    borderRadius: '999px',
  },
  removeBtn: {
    padding: '7px 12px',
    background: '#fff',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  fieldLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  fieldInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  fieldTextarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  confirmBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  confirmText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#374151',
  },
  refreshBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 0',
    marginBottom: '4px',
  },
  refreshText: {
    fontSize: '12px',
    color: '#6b7280',
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '1.25rem',
    gap: '4px',
  },
  tabBtn: {
    padding: '8px 18px',
    fontSize: '14px',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    color: '#6b7280',
    fontFamily: 'inherit',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '-1px',
  },
  tabBtnActive: {
    color: '#4f46e5',
    borderBottomColor: '#4f46e5',
  },
  unsettledDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#dc2626',
    display: 'inline-block',
  },
  settlementList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
};

export default GroupPage;