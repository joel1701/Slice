const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    groupId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    paidBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true, trim: true, maxlength: 100 },
    amount:      { type: Number, required: true, min: 0.01 },
    category:    {
      type: String,
      enum: ['food','travel','accommodation','shopping','utilities','entertainment','other'],
      default: 'other',
    },
    splitType:   { type: String, enum: ['equal','exact','percentage'], default: 'equal' },
    date:        { type: Date, default: Date.now },

    // ── NEW FIELDS ────────────────────────────────────────────────────────────
    // notes: optional text the payer can add for context
    // e.g. "included the service charge and tip"
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },

    // receiptUrl: the Cloudinary URL of the uploaded receipt image
    // receiptPublicId: Cloudinary's internal ID — needed to delete the image later
    receiptUrl:      { type: String, default: '' },
    receiptPublicId: { type: String, default: '' },
  },
  { timestamps: true }
);

expenseSchema.index({ groupId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);