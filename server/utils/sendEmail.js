const transporter = require('../config/email');

// ── SEND EMAIL ────────────────────────────────────────────────────────────────
// options shape: { to, subject, html }
// we wrap this in try/catch so a failed email never crashes an API request
// emails are best-effort — if one fails, the user's action still succeeds
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER ? `Slice <${process.env.EMAIL_USER}>` : process.env.EMAIL_FROM,
      replyTo: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    // log the error but don't throw — a failed email shouldn't fail the request
    console.error(`Failed to send email to ${to}:`, error.message);
    return false;
  }
};

module.exports = sendEmail;