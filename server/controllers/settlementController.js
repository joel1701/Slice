const mongoose = require('mongoose');
const ExpenseSplit = require('../models/ExpenseSplit');
const GroupMember = require('../models/GroupMember');
const Group = require('../models/Group');
const User = require('../models/User');

const roundAmount = (value) => Math.round(Number(value) * 100) / 100;

const buildSettlements = (balances) => {
  const creditors = balances
    .filter((balance) => balance.netAmount > 0)
    .map((balance) => ({ ...balance }));
  const debtors = balances
    .filter((balance) => balance.netAmount < 0)
    .map((balance) => ({ ...balance }));

  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Math.min(creditor.netAmount, Math.abs(debtor.netAmount));

    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: roundAmount(amount),
      fromUser: debtor.user,
      toUser: creditor.user,
    });

    creditor.netAmount = roundAmount(creditor.netAmount - amount);
    debtor.netAmount = roundAmount(debtor.netAmount + amount);

    if (creditor.netAmount <= 0.01) creditorIndex += 1;
    if (debtor.netAmount >= -0.01) debtorIndex += 1;
  }

  return settlements;
};

const getBalances = async (req, res) => {
  try {
    const groupId = req.params.id;

    const membership = await GroupMember.findOne({ groupId, userId: req.user.id });
    if (!membership) return res.status(403).json({ message: 'You are not a member of this group' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const members = await GroupMember.find({ groupId }).populate('userId', 'name email avatarUrl');

    const balancesByUser = new Map();
    members.forEach((member) => {
      balancesByUser.set(member.userId._id.toString(), {
        userId: member.userId._id.toString(),
        netAmount: 0,
        user: member.userId.toObject(),
      });
    });

    const unsettledSplits = await ExpenseSplit.aggregate([
      { $match: { settled: false } },
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

    for (const split of unsettledSplits) {
      const payerId = split.expense.paidBy?.toString();
      const debtorId = split.userId?.toString();
      const shareAmount = Number(split.shareAmount) || 0;

      if (!payerId || !debtorId || payerId === debtorId) {
        continue;
      }

      const payerBalance = balancesByUser.get(payerId);
      const debtorBalance = balancesByUser.get(debtorId);

      if (payerBalance) payerBalance.netAmount += shareAmount;
      if (debtorBalance) debtorBalance.netAmount -= shareAmount;
    }

    const balances = Array.from(balancesByUser.values()).map((balance) => ({
      ...balance,
      netAmount: roundAmount(balance.netAmount),
    }));

    const settlements = buildSettlements(balances);
    const isSettled = settlements.length === 0;

    res.status(200).json({ balances, settlements, isSettled });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ message: 'Server error fetching balances' });
  }
};

const recordSettlement = async (req, res) => {
  try {
    const { toUserId, amount } = req.body;
    const groupId = req.params.id;
    const fromUserId = req.user.id;

    if (!toUserId || !amount)
      return res.status(400).json({ message: 'toUserId and amount are required' });

    const mongoose = require('mongoose');

    const unsettledSplits = await ExpenseSplit.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(fromUserId), settled: false } },
      { $lookup: { from: 'expenses', localField: 'expenseId', foreignField: '_id', as: 'expense' } },
      { $unwind: '$expense' },
      {
        $match: {
          'expense.groupId': new mongoose.Types.ObjectId(groupId),
          'expense.paidBy': new mongoose.Types.ObjectId(toUserId),
        },
      },
    ]);

    const splitIds = unsettledSplits.map((s) => s._id);
    await ExpenseSplit.updateMany({ _id: { $in: splitIds } }, { $set: { settled: true } });

    // ── send settlement notification email to the creditor ──
    const Group = require('../models/Group');
    const User = require('../models/User');
    const sendEmail = require('../utils/sendEmail');
    const { settlementEmail } = require('../utils/emailTemplates');

    const group = await Group.findById(groupId);
    const payer = await User.findById(fromUserId);
    const creditor = await User.findById(toUserId);

    if (creditor?.email) {
      sendEmail({
        to: creditor.email,
        subject: `${payer.name} settled up with you in "${group.name}"`,
        html: settlementEmail({
          payerName: payer.name,
          recipientName: creditor.name,
          groupName: group.name,
          amount,
          currency: group.currency,
          groupId,
        }),
      });
    }

    res.status(200).json({ message: 'Settlement recorded', splitsSettled: splitIds.length });
  } catch (error) {
    console.error('Settlement error:', error);
    res.status(500).json({ message: 'Server error recording settlement' });
  }
};

module.exports = { getBalances, recordSettlement };