import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// This file is deliberately self-contained: when Vercel's Root Directory is
// `frontend`, it deploys this complete API as one serverless function.
let databasePromise;
const connectDatabase = () => {
  if (!databasePromise) {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured.');
    databasePromise = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
      .catch((error) => { databasePromise = undefined; throw error; });
  }
  return databasePromise;
};

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  recoveryKeywordHash: { type: String, required: true, select: false },
  isPremium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}));

const Journal = mongoose.models.Journal || mongoose.model('Journal', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  encryptedContent: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
  moodScore: { type: Number, required: true },
  energyScore: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  promptUsed: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}));

const key = () => {
  const value = process.env.MASTER_KEY;
  if (!value || value.length < 32) throw new Error('MASTER_KEY must be at least 32 characters.');
  return crypto.createHash('sha256').update(value, 'utf8').digest();
};
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  return { encrypted: cipher.update(text, 'utf8', 'hex') + cipher.final('hex'), iv: iv.toString('hex'), authTag: cipher.getAuthTag().toString('hex') };
};
const decrypt = ({ encryptedContent, iv, authTag }) => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  return decipher.update(encryptedContent, 'hex', 'utf8') + decipher.final('utf8');
};
const publicEntry = (entry) => ({ id: entry._id, content: decrypt(entry), moodScore: entry.moodScore, energyScore: entry.energyScore, date: entry.date, promptUsed: entry.promptUsed, createdAt: entry.createdAt });
const emailOf = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';
const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
const userPayload = (user, token) => ({ ...(token ? { token } : {}), user: { id: user._id, email: user.email, isPremium: user.isPremium } });

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',').map((origin) => origin.trim());
app.use(cors({ origin(origin, callback) { return !origin || allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('Origin not allowed by CORS')); } }));
app.use(express.json({ limit: '100kb' }));

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-passwordHash');
    return req.user ? next() : res.status(401).json({ message: 'Not authorized, user not found' });
  } catch { return res.status(401).json({ message: 'Not authorized, token failed' }); }
};

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/auth/register', async (req, res) => {
  const { password, recoveryKeyword } = req.body;
  const email = emailOf(req.body.email);
  if (!email || !password || !recoveryKeyword) return res.status(400).json({ message: 'Email, password, and recovery keyword are required.' });
  if (typeof password !== 'string' || password.length < 6 || typeof recoveryKeyword !== 'string' || recoveryKeyword.trim().length < 3) return res.status(400).json({ message: 'Password must be at least 6 characters and recovery keyword at least 3.' });
  try {
    if (await User.exists({ email })) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const user = await User.create({ email, passwordHash: await bcrypt.hash(password, salt), recoveryKeywordHash: await bcrypt.hash(recoveryKeyword, salt) });
    return res.status(201).json(userPayload(user, tokenFor(user._id)));
  } catch (error) { return res.status(error.code === 11000 ? 400 : 500).json({ message: error.code === 11000 ? 'Email already exists' : 'Server Error' }); }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: emailOf(req.body.email) });
    if (!user || !await bcrypt.compare(req.body.password || '', user.passwordHash)) return res.status(401).json({ message: 'Invalid email or password' });
    return res.json(userPayload(user, tokenFor(user._id)));
  } catch { return res.status(500).json({ message: 'Server Error' }); }
});
app.post('/api/auth/recover', async (req, res) => {
  const { recoveryKeyword, newPassword } = req.body;
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  try {
    const user = await User.findOne({ email: emailOf(req.body.email) }).select('+recoveryKeywordHash');
    if (!user || !await bcrypt.compare(recoveryKeyword || '', user.recoveryKeywordHash)) return res.status(401).json({ message: 'Invalid email or recovery keyword' });
    user.passwordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10)); await user.save();
    return res.json({ message: 'Password Reset Successful' });
  } catch { return res.status(500).json({ message: 'Server Error' }); }
});
app.post('/api/journal', protect, async (req, res) => {
  const { content, moodScore, energyScore, date, promptUsed } = req.body;
  if (typeof content !== 'string' || !content.trim() || content.length > 10000 || !Number.isInteger(moodScore) || moodScore < 1 || moodScore > 10 || !Number.isInteger(energyScore) || energyScore < 1 || energyScore > 10) return res.status(400).json({ message: 'Invalid journal entry.' });
  try { const entry = await Journal.create({ userId: req.user._id, ...encrypt(content), moodScore, energyScore, date, promptUsed }); return res.status(201).json(publicEntry(entry)); } catch { return res.status(500).json({ message: 'Unable to save journal entry.' }); }
});
app.get('/api/journal', protect, async (req, res) => {
  const query = { userId: req.user._id };
  if (!req.user.isPremium) { const start = new Date(); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); query.date = { $gte: start, $lte: new Date() }; }
  else { if (req.query.prompt) query.promptUsed = { $regex: req.query.prompt, $options: 'i' }; const dates = {}; if (req.query.startDate) dates.$gte = new Date(req.query.startDate); if (req.query.endDate) dates.$lte = new Date(`${req.query.endDate}T23:59:59.999Z`); if (Object.keys(dates).length) query.date = dates; }
  try { return res.json((await Journal.find(query).sort({ date: -1 })).map(publicEntry)); } catch { return res.status(500).json({ message: 'Server Error' }); }
});
app.get('/api/journal/prompt', protect, async (req, res) => { if (!req.user.isPremium) return res.status(403).json({ message: 'This feature is only available for premium members.' }); if (!req.query.prompt) return res.status(400).json({ message: 'Prompt parameter is required.' }); try { return res.json((await Journal.find({ userId: req.user._id, promptUsed: req.query.prompt }).sort({ date: -1 })).map(publicEntry)); } catch { return res.status(500).json({ message: 'Server Error' }); } });
app.get('/api/journal/export', protect, async (req, res) => { if (!req.user.isPremium) return res.status(403).json({ message: 'Export is only available for premium members.' }); try { const entries = (await Journal.find({ userId: req.user._id }).sort({ date: -1 })).map(publicEntry); return res.json({ user: userPayload(req.user).user, exportDate: new Date().toISOString(), totalEntries: entries.length, entries }); } catch { return res.status(500).json({ message: 'Server Error' }); } });

export default async function handler(req, res) {
  if (!process.env.JWT_SECRET || !process.env.MASTER_KEY || process.env.MASTER_KEY.length < 32) return res.status(500).json({ message: 'Server configuration is incomplete.' });
  try { await connectDatabase(); return app(req, res); } catch (error) { console.error('API startup failed:', error); return res.status(503).json({ message: 'Service is temporarily unavailable.' }); }
}
