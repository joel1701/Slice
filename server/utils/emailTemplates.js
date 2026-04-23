// ── BASE TEMPLATE ─────────────────────────────────────────────────────────────
// wraps content in a consistent shell with header and footer
// all specific email templates call this
const base = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:'Segoe UI',Arial,sans-serif; }
    .shell { max-width:560px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e4e4e7; }
    .header { background:#0f0f10; padding:24px 32px; display:flex; align-items:center; gap:10px; }
    .header-logo { font-size:18px; font-weight:700; color:#ffffff; letter-spacing:-0.3px; }
    .header-dot { width:8px; height:8px; border-radius:50%; background:#10b981; display:inline-block; margin-right:4px; }
    .body { padding:32px; }
    .footer { padding:20px 32px; background:#f4f4f5; border-top:1px solid #e4e4e7; }
    .footer p { font-size:12px; color:#9b9ba2; margin:0; line-height:1.6; }
    h2 { font-size:22px; font-weight:700; color:#0f0f10; margin:0 0 8px; letter-spacing:-0.4px; }
    p { font-size:15px; color:#3f3f44; line-height:1.65; margin:0 0 16px; }
    .btn { display:inline-block; padding:12px 28px; background:#10b981; color:#ffffff !important; border-radius:8px; font-size:15px; font-weight:600; text-decoration:none; margin:8px 0 20px; }
    .divider { height:1px; background:#e4e4e7; margin:24px 0; }
    .small { font-size:13px; color:#9b9ba2; }
    .highlight { background:#f0fdf4; border-left:3px solid #10b981; padding:12px 16px; border-radius:0 8px 8px 0; margin:16px 0; }
    .highlight p { margin:0; font-size:14px; color:#065f46; }
    .stat-row { display:flex; gap:12px; margin:20px 0; }
    .stat { flex:1; background:#f4f4f5; border-radius:8px; padding:14px; text-align:center; }
    .stat-val { font-size:22px; font-weight:700; color:#0f0f10; display:block; font-family:monospace; }
    .stat-lbl { font-size:12px; color:#9b9ba2; margin-top:3px; display:block; }
    .expense-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f4f4f5; font-size:14px; }
    .expense-row:last-child { border-bottom:none; }
    .expense-desc { color:#0f0f10; font-weight:500; }
    .expense-meta { color:#9b9ba2; font-size:12px; margin-top:2px; }
    .expense-amt { color:#0f0f10; font-weight:600; font-family:monospace; white-space:nowrap; }
  </style>
</head>
<body>
  <div class="shell">
    <div class="header">
      <span class="header-dot"></span>
      <span class="header-logo">Slice</span>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>You're receiving this because you have a Slice account.<br/>
      Questions? Reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

// ── GROUP INVITE EMAIL ────────────────────────────────────────────────────────
// sent when a user is added to a group
const groupInviteEmail = ({ inviterName, groupName, groupId, recipientName }) =>
  base('You were added to a group', `
    <h2>You've been added to a group</h2>
    <p>Hi ${recipientName},</p>
    <p><strong>${inviterName}</strong> added you to the group <strong>"${groupName}"</strong> on Slice.</p>
    <div class="highlight">
      <p>You can now see all expenses in this group and your share of the costs.</p>
    </div>
    <a href="${process.env.CLIENT_URL}/group/${groupId}" class="btn">View group →</a>
    <div class="divider"></div>
    <p class="small">If you don't recognise this, you can safely ignore this email.</p>
  `);

// ── EXPENSE ADDED EMAIL ───────────────────────────────────────────────────────
// sent to all group members (except the payer) when a new expense is logged
const expenseAddedEmail = ({ payerName, groupName, groupId, description, amount, currency, shareAmount, recipientName }) => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] || '';
  return base('New expense in your group', `
    <h2>New expense added</h2>
    <p>Hi ${recipientName},</p>
    <p><strong>${payerName}</strong> added an expense to <strong>"${groupName}"</strong>.</p>
    <div class="stat-row">
      <div class="stat">
        <span class="stat-val">${sym}${Number(amount).toLocaleString('en-IN')}</span>
        <span class="stat-lbl">Total amount</span>
      </div>
      <div class="stat">
        <span class="stat-val">${sym}${Number(shareAmount).toLocaleString('en-IN')}</span>
        <span class="stat-lbl">Your share</span>
      </div>
    </div>
    <div class="highlight">
      <p><strong>${description}</strong> — paid by ${payerName}</p>
    </div>
    <a href="${process.env.CLIENT_URL}/group/${groupId}" class="btn">View in Slice →</a>
  `);
};

// ── SETTLEMENT EMAIL ──────────────────────────────────────────────────────────
// sent to the creditor when someone marks a debt as settled
const settlementEmail = ({ payerName, recipientName, groupName, amount, currency, groupId }) => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] || '';
  return base('Someone settled up with you', `
    <h2>${sym}${Number(amount).toLocaleString('en-IN')} settled</h2>
    <p>Hi ${recipientName},</p>
    <p><strong>${payerName}</strong> marked their debt to you as settled in <strong>"${groupName}"</strong>.</p>
    <div class="highlight">
      <p>Amount: <strong>${sym}${Number(amount).toLocaleString('en-IN')}</strong></p>
    </div>
    <a href="${process.env.CLIENT_URL}/group/${groupId}" class="btn">View group →</a>
  `);
};

// ── PASSWORD RESET EMAIL ──────────────────────────────────────────────────────
// sent when a user requests a password reset
const passwordResetEmail = ({ name, resetUrl }) =>
  base('Reset your password', `
    <h2>Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your Slice password. Click the button below to set a new one.</p>
    <a href="${resetUrl}" class="btn">Reset password →</a>
    <div class="divider"></div>
    <p class="small">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
    <p class="small">If the button doesn't work, copy this link: ${resetUrl}</p>
  `);

// ── MONTHLY SUMMARY EMAIL ─────────────────────────────────────────────────────
// sent on the 1st of each month with the user's expense summary
const monthlySummaryEmail = ({ name, month, totalSpent, currency, groupCount, topExpenses, totalOwed, totalOwing }) => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] || '₹';
  const expenseRows = topExpenses.map(e => `
    <div class="expense-row">
      <div>
        <div class="expense-desc">${e.description}</div>
        <div class="expense-meta">${e.groupName} · ${new Date(e.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</div>
      </div>
      <div class="expense-amt">${sym}${Number(e.amount).toLocaleString('en-IN')}</div>
    </div>
  `).join('');

  return base(`Your ${month} summary`, `
    <h2>Your ${month} summary</h2>
    <p>Hi ${name}, here's how your expenses looked last month.</p>
    <div class="stat-row">
      <div class="stat">
        <span class="stat-val">${sym}${Number(totalSpent).toLocaleString('en-IN')}</span>
        <span class="stat-lbl">Total spent</span>
      </div>
      <div class="stat">
        <span class="stat-val">${groupCount}</span>
        <span class="stat-lbl">Active groups</span>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat">
        <span class="stat-val" style="color:#10b981">${sym}${Number(totalOwed).toLocaleString('en-IN')}</span>
        <span class="stat-lbl">You are owed</span>
      </div>
      <div class="stat">
        <span class="stat-val" style="color:#ef4444">${sym}${Number(totalOwing).toLocaleString('en-IN')}</span>
        <span class="stat-lbl">You owe</span>
      </div>
    </div>
    ${topExpenses.length > 0 ? `
      <div class="divider"></div>
      <p><strong>Recent expenses</strong></p>
      ${expenseRows}
    ` : ''}
    <div class="divider"></div>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Open Slice →</a>
  `);
};

module.exports = {
  groupInviteEmail,
  expenseAddedEmail,
  settlementEmail,
  passwordResetEmail,
  monthlySummaryEmail,
};