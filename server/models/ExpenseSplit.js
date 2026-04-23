const mongoose = require('mongoose');

const expenseSplitSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      required: true,
    },

    // which user this split belongs to
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // the actual rupee/dollar amount this person owes for this expense
    // always stored as the final number regardless of split type
    // e.g. for a ₹300 expense split equally among 3 people, shareAmount = 100 for each
    shareAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // false = this person still owes their share
    // true  = this debt has been settled via a Settlement record
    settled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// this index is critical — it's used every time we compute balances
// "find all unsettled splits for user X" runs on every group page load
expenseSplitSchema.index({ userId: 1, settled: 1 });

// also useful: "find all splits for expense X" — used when deleting an expense
expenseSplitSchema.index({ expenseId: 1 });

module.exports = mongoose.model('ExpenseSplit', expenseSplitSchema);