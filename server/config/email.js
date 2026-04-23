const nodemailer = require('nodemailer');

const emailPort = Number(process.env.EMAIL_PORT || 587);
const emailHost = (process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
const placeholderValues = new Set([
  'yourchosenemail@gmail.com',
  'your_16_char_app_password',
  'your-cloud-name',
  'your_cloud_name',
  'your_api_key',
  'your_api_secret',
]);

const hasPlaceholderEmailConfig = [
  emailHost,
  process.env.EMAIL_PORT,
  process.env.EMAIL_USER,
  process.env.EMAIL_PASS,
].some((value) => placeholderValues.has(String(value || '').trim().replace(/^"|"$/g, '')));

// ── create a reusable transporter ─────────────────────────────────────────────
// a transporter is a nodemailer object that knows HOW to send email
// (which server to use, what credentials to use)
// we create it once here and export it — other files just call transporter.sendMail()
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── verify the connection on startup ─────────────────────────────────────────
// this checks the credentials are correct when the server boots
// if they're wrong, you see the error immediately instead of at email-send time
const hasEmailConfig = Boolean(
  emailHost &&
  emailPort &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  !hasPlaceholderEmailConfig
);

if (hasEmailConfig) {
  transporter.verify((error) => {
    if (error) {
      console.error('Email transporter error:', error.message);
    } else {
      console.log('Email transporter ready');
    }
  });
} else {
  console.log('Email transporter skipped: incomplete or placeholder email configuration');
}

module.exports = transporter;