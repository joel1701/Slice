const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const Expense = require('../models/Expense');
const ExpenseSplit = require('../models/ExpenseSplit');
const GroupMember = require('../models/GroupMember');
const Group = require('../models/Group');
const sendEmail = require('../utils/sendEmail');
const { monthlySummaryEmail } = require('../utils/emailTemplates');

// ── COMPUTE SUMMARY FOR ONE USER ──────────────────────────────────────────────
const computeUserSummary = async (userId, startDate, endDate) => {
  // get all groups this user belongs to
  const memberships = await GroupMember.find({ userId });
  const groupIds = memberships.map((m) => m.groupId);

  // find all expenses in those groups within the date range
  const expenses = await Expense.find({
    groupId: { $in: groupIds },
    date: { $gte: startDate, $lte: endDate },
  }).populate('groupId', 'name currency');

  // total amount the user spent (expenses they paid for)
  const totalSpent = expenses
    .filter((e) => e.paidBy?.toString() === userId.toString())
    .reduce((sum, e) => sum + e.amount, 0);

  // top 5 most recent expenses across their groups
  const topExpenses = expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((e) => ({
      description: e.description,
      amount: e.amount,
      date: e.date,
      groupName: e.groupId?.name || 'Unknown group',
    }));

  // compute how much the user is owed vs how much they owe
  // using the existing unsettled split logic
  const unsettledSplits = await ExpenseSplit.aggregate([
    { $match: { settled: false } },
    { $lookup: { from: 'expenses', localField: 'expenseId', foreignField: '_id', as: 'expense' } },
    { $unwind: '$expense' },
    { $match: { 'expense.groupId': { $in: groupIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
  ]);

  let totalOwed = 0;  // money coming TO this user
  let totalOwing = 0; // money going FROM this user

  const userIdStr = userId.toString();

  for (const split of unsettledSplits) {
    const payerId = split.expense.paidBy?.toString();
    const debtorId = split.userId?.toString();

    if (payerId === userIdStr && debtorId !== userIdStr) {
      totalOwed += split.shareAmount;
    } else if (debtorId === userIdStr && payerId !== userIdStr) {
      totalOwing += split.shareAmount;
    }
  }

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalOwed: Math.round(totalOwed * 100) / 100,
    totalOwing: Math.round(totalOwing * 100) / 100,
    groupCount: groupIds.length,
    topExpenses,
  };
};

// ── SEND MONTHLY SUMMARY TO ALL USERS ────────────────────────────────────────
const sendMonthlySummaries = async () => {
  console.log('Running monthly summary job...');

  // compute date range for last month
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 1st of last month
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0);       // last day of last month

  const monthName = startDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // get all users
  const users = await User.find({}, 'name email');
  console.log(`Sending monthly summaries to ${users.length} users`);

  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  // process users in batches of 10 to avoid overwhelming the email server
  const batchSize = 10;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (user) => {
        try {
          const summary = await computeUserSummary(user._id, startDate, endDate);

          // skip users with no activity last month — no point emailing them
          if (summary.totalSpent === 0 && summary.totalOwed === 0 && summary.totalOwing === 0) {
            skippedCount += 1;
            return;
          }

          const emailSent = await sendEmail({
            to: user.email,
            subject: `Your Slice summary for ${monthName}`,
            html: monthlySummaryEmail({
              name: user.name,
              month: monthName,
              currency: 'INR', // TODO: use per-user preference later
              ...summary,
            }),
          });

          if (emailSent) {
            sentCount += 1;
          } else {
            failedCount += 1;
          }
        } catch (error) {
          failedCount += 1;
          console.error(`Failed to send summary to ${user.email}:`, error.message);
        }
      })
    );

    // wait 1 second between batches to respect email rate limits
    if (i + batchSize < users.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`Monthly summary job complete. Sent: ${sentCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`);

  return {
    monthName,
    users: users.length,
    sent: sentCount,
    skipped: skippedCount,
    failed: failedCount,
  };
};

// ── SCHEDULE THE CRON JOB ─────────────────────────────────────────────────────
// cron syntax: '0 8 1 * *'
// minute=0, hour=8, day=1, month=any, weekday=any
// = runs at 8:00 AM on the 1st of every month
const scheduleMonthlySummary = () => {
  cron.schedule('0 8 1 * *', async () => {
    try {
      await sendMonthlySummaries();
    } catch (error) {
      console.error('Monthly summary cron error:', error);
    }
  });

  console.log('Monthly summary cron job scheduled (1st of each month, 8:00 AM)');
};

// export both so you can trigger manually for testing
module.exports = { scheduleMonthlySummary, sendMonthlySummaries };