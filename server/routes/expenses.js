const express = require('express');
const router = express.Router();

const {
  getExpenseSplits,
  deleteExpense,
} = require('../controllers/expenseController');

const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);


router.get('/:id/splits', getExpenseSplits); 
router.delete('/:id', deleteExpense);        

module.exports = router;