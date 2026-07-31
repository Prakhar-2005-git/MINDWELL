import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const normalizeEmail = (email) => {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const createUserRecord = async ({ email, passwordHash, recoveryKeywordHash }) => {
  return User.create({ email, passwordHash, recoveryKeywordHash });
};

const updateUserPassword = async (user, newPasswordHash) => {
  user.passwordHash = newPasswordHash;
  await user.save();
  return user;
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { email, password, recoveryKeyword } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password || !recoveryKeyword) {
    return res.status(400).json({ message: 'Email, password, and recovery keyword are required.' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  if (typeof recoveryKeyword !== 'string' || recoveryKeyword.trim().length < 3) {
    return res.status(400).json({ message: 'Recovery keyword must be at least 3 characters long.' });
  }

  try {
    const userExists = await findUserByEmail(normalizedEmail);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const recoveryKeywordHash = await bcrypt.hash(recoveryKeyword, salt);

    const user = await createUserRecord({
      email: normalizedEmail,
      passwordHash,
      recoveryKeywordHash,
    });

    if (user) {
      const token = generateToken(user._id);
      return res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          isPremium: user.isPremium,
        },
      });
    }

    return res.status(400).json({ message: 'Invalid user data' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ message: 'Authentication service is currently unavailable. Please try again later.' });
    }

    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await findUserByEmail(normalizeEmail(email));

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const token = generateToken(user._id);
      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          isPremium: user.isPremium,
        },
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ message: 'Authentication service is currently unavailable. Please try again later.' });
    }

    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Recover user account password
 * @route   POST /api/auth/recover
 * @access  Public
 */
export const recoverUser = async (req, res) => {
  const { email, recoveryKeyword, newPassword } = req.body;

  if (!email || !recoveryKeyword || !newPassword) {
    return res.status(400).json({ message: 'Email, recovery keyword, and new password are required.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    const user = await User.findOne({ email: normalizeEmail(email) }).select('+recoveryKeywordHash');

    if (user && (await bcrypt.compare(recoveryKeyword, user.recoveryKeywordHash))) {
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);
      await updateUserPassword(user, newPasswordHash);

      return res.status(200).json({ message: 'Password Reset Successful' });
    }

    return res.status(401).json({ message: 'Invalid email or recovery keyword' });
  } catch (error) {
    if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ message: 'Authentication service is currently unavailable. Please try again later.' });
    }

    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
