const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // 'admin' can delete the group and manage members
    // 'member' can add expenses and settle up
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  { timestamps: true }
);

// ── COMPOUND INDEX ──────────────────────────────────────────────────────────
// This does two things:
// 1. Makes queries like "find member where groupId=X and userId=Y" very fast
// 2. unique: true prevents the same user from being added to the same group twice
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('GroupMember', groupMemberSchema);