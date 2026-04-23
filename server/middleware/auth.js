const jwt = require('jsonwebtoken');
const User = require('../models/User');

// AUTH MIDDLEWARE 
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // extracting the token from the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No token provided. Please log in.',
      });
    }

    // verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // confirming whether the user still exists in the database 
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: 'Token is valid but user no longer exists',
      });
    }
    // attaching user info to the request object for use in route handlers
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    // Step 5: passing control to the next function (the actual route handler)
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired. Please log in again.',
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

module.exports = authMiddleware;