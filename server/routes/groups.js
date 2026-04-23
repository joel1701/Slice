const express = require('express');
const router = express.Router();
const { createGroup, getUserGroups, getGroup, editGroup, deleteGroup, addMember, removeMember } = require('../controllers/groupController');
const { addExpense, getExpenses } = require('../controllers/expenseController');
const { getBalances, recordSettlement } = require('../controllers/settlementController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(authMiddleware);

router.post('/',    createGroup);
router.get('/',     getUserGroups);
router.get('/:id',  getGroup);
router.patch('/:id', editGroup);       // ← new: edit group
router.delete('/:id', deleteGroup);   // ← new: delete group

router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember); // ← new: remove member

// upload.single('receipt') runs multer BEFORE addExpense
// if the user attached a file, it gets uploaded to Cloudinary
// and req.file is populated by the time addExpense runs
router.post('/:id/expenses', upload.single('receipt'), addExpense);
router.get('/:id/expenses',  getExpenses);

router.get('/:id/balances',  getBalances);
router.post('/:id/settle',   recordSettlement);

module.exports = router;