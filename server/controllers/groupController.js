const crypto = require('crypto');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Expense = require('../models/Expense');
const ExpenseSplit = require('../models/ExpenseSplit');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { groupInviteEmail } = require('../utils/emailTemplates');

// ── CREATE GROUP ──────────────────────────────────────────────────────────────
const createGroup = async (req, res) => {
  try {
    const { name, description, currency } = req.body;
    if (!name) return res.status(400).json({ message: 'Group name is required' });

    // generate a random invite token for the shareable link
    const inviteToken = crypto.randomBytes(16).toString('hex');

    const group = await Group.create({
      name, description,
      currency: currency || 'INR',
      createdBy: req.user.id,
      inviteToken,
    });

    await GroupMember.create({ groupId: group._id, userId: req.user.id, role: 'admin' });

    res.status(201).json({ message: 'Group created successfully', group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error creating group' });
  }
};

// ── GET ALL GROUPS FOR USER ───────────────────────────────────────────────────
const getUserGroups = async (req, res) => {
  try {
    const memberships = await GroupMember.find({ userId: req.user.id }).populate('groupId');
    const groups = memberships
      .filter((m) => m.groupId) // filter out any orphaned memberships
      .map((m) => ({ ...m.groupId.toObject(), userRole: m.role }));
    res.status(200).json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error fetching groups' });
  }
};

// ── GET SINGLE GROUP ──────────────────────────────────────────────────────────
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('createdBy', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const membership = await GroupMember.findOne({ groupId: req.params.id, userId: req.user.id });
    if (!membership) return res.status(403).json({ message: 'You are not a member of this group' });

    const members = await GroupMember.find({ groupId: req.params.id }).populate('userId', 'name email avatarUrl');
    res.status(200).json({ group, members });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error fetching group' });
  }
};

// ── EDIT GROUP ────────────────────────────────────────────────────────────────
// PATCH /api/groups/:id
// only admin can edit
const editGroup = async (req, res) => {
  try {
    const { name, description, currency } = req.body;

    // confirm the user is an admin of this group
    const membership = await GroupMember.findOne({ groupId: req.params.id, userId: req.user.id });
    if (!membership) return res.status(403).json({ message: 'You are not a member of this group' });
    if (membership.role !== 'admin') return res.status(403).json({ message: 'Only group admins can edit the group' });

    // build update object with only the fields that were provided
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (currency !== undefined) updates.currency = currency;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: 'No fields to update' });

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true } // new: true returns the updated doc
    );

    if (!group) return res.status(404).json({ message: 'Group not found' });

    res.status(200).json({ message: 'Group updated', group });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: msgs.join('. ') });
    }
    console.error('Edit group error:', error);
    res.status(500).json({ message: 'Server error updating group' });
  }
};

// ── DELETE GROUP ──────────────────────────────────────────────────────────────
// DELETE /api/groups/:id
// only admin can delete — cascades to all related data
const deleteGroup = async (req, res) => {
  try {
    const membership = await GroupMember.findOne({ groupId: req.params.id, userId: req.user.id });
    if (!membership) return res.status(403).json({ message: 'You are not a member of this group' });
    if (membership.role !== 'admin') return res.status(403).json({ message: 'Only group admins can delete the group' });

    const groupId = req.params.id;

    // cascade delete — remove all data associated with this group
    // order matters: splits reference expenses, so delete splits first
    const expenses = await Expense.find({ groupId });
    const expenseIds = expenses.map((e) => e._id);

    // delete all splits for all expenses in this group
    if (expenseIds.length > 0) {
      await ExpenseSplit.deleteMany({ expenseId: { $in: expenseIds } });
    }

    await Expense.deleteMany({ groupId });
    await GroupMember.deleteMany({ groupId });
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: 'Group and all associated data deleted' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Server error deleting group' });
  }
};

// ── ADD MEMBER ────────────────────────────────────────────────────────────────
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const requesterMembership = await GroupMember.findOne({ groupId: req.params.id, userId: req.user.id });
    if (!requesterMembership) return res.status(403).json({ message: 'You are not a member of this group' });

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) return res.status(404).json({ message: 'No account found with that email. They need to register first.' });

    const alreadyMember = await GroupMember.findOne({ groupId: req.params.id, userId: userToAdd._id });
    if (alreadyMember) return res.status(400).json({ message: 'This person is already in the group' });

    const group = await Group.findById(req.params.id);
    const inviter = await User.findById(req.user.id);

    await GroupMember.create({ groupId: req.params.id, userId: userToAdd._id, role: 'member' });

    // ── send invite email ──
    // fire and forget — don't await so it doesn't slow down the API response
    sendEmail({
      to: userToAdd.email,
      subject: `${inviter.name} added you to "${group.name}" on Slice`,
      html: groupInviteEmail({
        inviterName: inviter.name,
        groupName: group.name,
        groupId: group._id,
        recipientName: userToAdd.name,
      }),
    });

    res.status(201).json({
      message: `${userToAdd.name} added to the group`,
      member: { id: userToAdd._id, name: userToAdd.name, email: userToAdd.email },
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error adding member' });
  }
};

// ── REMOVE MEMBER ─────────────────────────────────────────────────────────────
// DELETE /api/groups/:id/members/:userId
// admin can remove anyone; a member can remove themselves (leave group)
// blocked if the member has unsettled debts
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const groupId = req.params.id;

    // check the requesting user's membership and role
    const requesterMembership = await GroupMember.findOne({ groupId, userId: req.user.id });
    if (!requesterMembership) return res.status(403).json({ message: 'You are not a member of this group' });

    // only admin can remove others; anyone can remove themselves
    const isSelf = userId === req.user.id.toString();
    if (!isSelf && requesterMembership.role !== 'admin')
      return res.status(403).json({ message: 'Only admins can remove other members' });

    // prevent removing the last admin — group would be unmanageable
    const targetMembership = await GroupMember.findOne({ groupId, userId });
    if (!targetMembership) return res.status(404).json({ message: 'Member not found in this group' });

    if (targetMembership.role === 'admin') {
      const adminCount = await GroupMember.countDocuments({ groupId, role: 'admin' });
      if (adminCount <= 1)
        return res.status(400).json({ message: 'Cannot remove the only admin. Transfer admin role first or delete the group.' });
    }

    // check for unsettled debts — we can't remove someone who still owes money
    // find unsettled splits where this user is the debtor, in this group
    const mongoose = require('mongoose');
    const unsettledSplits = await ExpenseSplit.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), settled: false } },
      {
        $lookup: {
          from: 'expenses',
          localField: 'expenseId',
          foreignField: '_id',
          as: 'expense',
        },
      },
      { $unwind: '$expense' },
      { $match: { 'expense.groupId': new mongoose.Types.ObjectId(groupId) } },
    ]);

    if (unsettledSplits.length > 0)
      return res.status(400).json({
        message: 'This member has unsettled debts. They need to settle up before being removed.',
      });

    await GroupMember.findOneAndDelete({ groupId, userId });

    res.status(200).json({ message: isSelf ? 'You left the group' : 'Member removed from group' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error removing member' });
  }
};

module.exports = { createGroup, getUserGroups, getGroup, editGroup, deleteGroup, addMember, removeMember };