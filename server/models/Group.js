const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    currency:    { type: String, enum: ['INR','USD','EUR','GBP'], default: 'INR' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // ── NEW: invite token ─────────────────────────────────────────────────────
    // generated when the group is created
    // anyone with the link /join/:inviteToken can join the group
    inviteToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);