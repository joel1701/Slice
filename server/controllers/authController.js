const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { passwordResetEmail } = require('../utils/emailTemplates');

// ── helper: generate JWT ───────────────────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── REGISTER ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please provide name, email, and password' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: 'An account with this email already exists' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ── GET CURRENT USER ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, createdAt: user.createdAt },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// generates a reset token, stores it on the user, emails it
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // IMPORTANT: always return the same response whether the email exists or not
    // this prevents attackers from using this endpoint to discover registered emails
    if (!user) {
      return res.status(200).json({
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    // generate a cryptographically random token
    // crypto.randomBytes(32) gives 32 random bytes
    // .toString('hex') converts them to a 64-character hex string
    const resetToken = crypto.randomBytes(32).toString('hex');

    // store the token and set expiry 1 hour from now
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    // save without triggering the password pre-save hook (password not modified)
    await user.save();

    // build the reset URL — the frontend will handle this route
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Reset your Slice password',
      html: passwordResetEmail({ name: user.name, resetUrl }),
    });

    if (!emailSent) {
      return res.status(502).json({ message: 'Password reset email could not be sent' });
    }

    res.status(200).json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
// POST /api/auth/reset-password/:token
// validates the token and sets the new password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // find user with this token AND whose token hasn't expired yet
    // $gt: Date.now() means "token expiry is greater than now" = not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    }).select('+resetToken +resetTokenExpiry +password');

    if (!user)
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    // set the new password — the pre-save hook will hash it
    user.password = password;
    // clear the reset token so it can't be reused
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };