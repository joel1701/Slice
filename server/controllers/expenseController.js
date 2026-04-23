const Expense = require('../models/Expense');
const ExpenseSplit = require('../models/ExpenseSplit');
const GroupMember = require('../models/GroupMember');
const Group = require('../models/Group');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const sendEmail = require('../utils/sendEmail');
const { expenseAddedEmail } = require('../utils/emailTemplates');

// ── ADD EXPENSE ───────────────────────────────────────────────────────────────
const addExpense = async (req, res) => {
  try {
    const { description, amount, category, splitType, date, paidBy, notes } = req.body;
    const groupId = req.params.id;

    if (!description || !amount)
      return res.status(400).json({ message: 'Description and amount are required' });

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return res.status(400).json({ message: 'Amount must be a positive number' });

    const membership = await GroupMember.findOne({ groupId, userId: req.user.id });
    if (!membership) return res.status(403).json({ message: 'You are not a member of this group' });

    const allMembers = await GroupMember.find({ groupId });
    if (allMembers.length === 0) return res.status(400).json({ message: 'No members found in group' });

    // ── handle receipt image ──
    // if multer processed an uploaded file, req.file will be populated
    // req.file.path is the Cloudinary URL, req.file.filename is the public ID
    let receiptUrl = '';
    let receiptPublicId = '';
    if (req.file) {
      receiptUrl = req.file.path;
      receiptPublicId = req.file.filename;
    }

    const expense = await Expense.create({
      groupId,
      paidBy: paidBy || req.user.id,
      description,
      amount: parsedAmount,
      category: category || 'other',
      splitType: splitType || 'equal',
      date: date || Date.now(),
      notes: notes || '',
      receiptUrl,
      receiptPublicId,
    });

    const memberCount = allMembers.length;
    const equalShare = Math.round((parsedAmount / memberCount) * 100) / 100;

    const splits = allMembers.map((m) => ({
      expenseId: expense._id,
      userId: m.userId,
      shareAmount: equalShare,
      settled: false,
    }));

    await ExpenseSplit.insertMany(splits);

    // ── send email notifications to all members except the payer ──
    const group = await Group.findById(groupId);
    const payer = await User.findById(paidBy || req.user.id);

    // get email of every member who is NOT the payer
    const membersToNotify = await Promise.all(
      allMembers
        .filter((m) => m.userId.toString() !== (paidBy || req.user.id).toString())
        .map((m) => User.findById(m.userId, 'name email'))
    );

    // fire all emails in parallel without awaiting them
    // this means the API responds immediately and emails send in the background
    membersToNotify.forEach((member) => {
      if (member?.email) {
        sendEmail({
          to: member.email,
          subject: `New expense in "${group.name}"`,
          html: expenseAddedEmail({
            payerName: payer.name,
            groupName: group.name,
            groupId: group._id,
            description,
            amount: parsedAmount,
            currency: group.currency,
            shareAmount: equalShare,
            recipientName: member.name,
          }),
        });
      }
    });

    const populated = await Expense.findById(expense._id).populate('paidBy', 'name email');

    res.status(201).json({
      message: 'Expense added successfully',
      expense: populated,
      splitCount: splits.length,
      sharePerPerson: equalShare,
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: 'Server error adding expense' });
  }
};

// ── GET EXPENSES ──────────────────────────────────────────────────────────────
const getExpenses = async (req, res) => {
  try {
    const groupId = req.params.id;
    const membership = await GroupMember.findOne({ groupId, userId: req.user.id });
    if (!membership) return res.status(403).json({ message: 'You are not a member of this group' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name email avatarUrl')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Expense.countDocuments({ groupId });

    res.status(200).json({
      expenses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalExpenses: total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
};

// ── GET EXPENSE SPLITS ────────────────────────────────────────────────────────
const getExpenseSplits = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('paidBy', 'name email');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const membership = await GroupMember.findOne({ groupId: expense.groupId, userId: req.user.id });
    if (!membership) return res.status(403).json({ message: 'Access denied' });

    const splits = await ExpenseSplit.find({ expenseId: req.params.id }).populate('userId', 'name email avatarUrl');
    res.status(200).json({ expense, splits });
  } catch (error) {
    console.error('Get splits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE EXPENSE ────────────────────────────────────────────────────────────
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.paidBy.toString() !== req.user.id.toString())
      return res.status(403).json({ message: 'Only the person who paid can delete this expense' });

    // if there's a receipt image on Cloudinary, delete it too
    // this prevents orphaned images accumulating in your Cloudinary account
    if (expense.receiptPublicId) {
      await cloudinary.uploader.destroy(expense.receiptPublicId);
    }

    await ExpenseSplit.deleteMany({ expenseId: req.params.id });
    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
};

module.exports = { addExpense, getExpenses, getExpenseSplits, deleteExpense };