const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const User = require('../models/User');
require('dotenv').config();

/**
 * Enhanced auth middleware with better error handling and debugging
 */
const authenticate = async (req) => {
  // 1. Check for authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('No authorization header found');
    return { user: null };
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.log('Malformed authorization header');
    return { user: null };
  }

  // 2. Extract token
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in authorization header');
    return { user: null };
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      console.log('Token missing userId');
      return { user: null };
    }

    // 4. Find user
    const user = await User.findById(decoded.userId)
      .select('-password -emailVerificationToken -passwordResetToken');
    
    if (!user) {
      console.log(`User not found with id: ${decoded.userId}`);
      return { user: null };
    }

    return { 
      user: {
        ...user.toObject(),
        userId: user._id.toString() // Ensure consistent ID format
      }
    };

  } catch (err) {
    console.error('Token verification failed:', err.message);
    return { user: null };
  }
};

module.exports = authenticate;