import Journal from '../models/Journal.js';
import { encrypt, decrypt } from '../utils/encryption.js';

/**
 * @desc    Create a new journal entry
 * @route   POST /api/journal
 * @access  Private
 */
export const createJournalEntry = async (req, res) => {
  const { content, moodScore, energyScore, date, promptUsed } = req.body;
  const userId = req.user._id;

  if (typeof content !== 'string' || !content.trim() || content.length > 10000) {
    return res.status(400).json({ message: 'Journal content must be between 1 and 10,000 characters.' });
  }

  if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 10 ||
      !Number.isInteger(energyScore) || energyScore < 1 || energyScore > 10) {
    return res.status(400).json({ message: 'Mood and energy scores must be whole numbers from 1 to 10.' });
  }

  try {
    const { encrypted, iv, authTag } = encrypt(content);

    const journalEntry = await Journal.create({
      userId,
      encryptedContent: encrypted,
      iv,
      authTag,
      moodScore,
      energyScore,
      date,
      promptUsed,
    });

    res.status(201).json({
      id: journalEntry._id,
      content: decrypt(journalEntry.encryptedContent, journalEntry.iv, journalEntry.authTag),
      moodScore: journalEntry.moodScore,
      energyScore: journalEntry.energyScore,
      date: journalEntry.date,
      promptUsed: journalEntry.promptUsed,
    });
  } catch (error) {
    console.error('Unable to create journal entry:', error);
    res.status(500).json({ message: 'Unable to save journal entry.' });
  }
};

/**
 * @desc    Get journal entries for a user
 * @route   GET /api/journal
 * @access  Private
 */
export const getJournalEntries = async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, prompt } = req.query;
  const isPremium = Boolean(req.user.isPremium);

  try {
    const query = { userId };

    if (!isPremium) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date();
      weekEnd.setHours(23, 59, 59, 999);

      query.date = { $gte: weekStart, $lte: weekEnd };
    } else {
      if (prompt) {
        query.promptUsed = { $regex: prompt, $options: 'i' };
      }

      const dateFilter = {};

      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (!Number.isNaN(parsedStartDate.getTime())) {
          parsedStartDate.setHours(0, 0, 0, 0);
          dateFilter.$gte = parsedStartDate;
        }
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (!Number.isNaN(parsedEndDate.getTime())) {
          parsedEndDate.setHours(23, 59, 59, 999);
          dateFilter.$lte = parsedEndDate;
        }
      }

      if (Object.keys(dateFilter).length > 0) {
        query.date = dateFilter;
      }
    }

    const journalEntries = await Journal.find(query).sort({ date: -1 });

    const decryptedEntries = journalEntries.map((entry) => {
      try {
        const decryptedContent = decrypt(entry.encryptedContent, entry.iv, entry.authTag);
        return {
          id: entry._id,
          content: decryptedContent,
          moodScore: entry.moodScore,
          energyScore: entry.energyScore,
          date: entry.date,
          promptUsed: entry.promptUsed,
        };
      } catch (error) {
        return {
          id: entry._id,
          content: 'Error decrypting content.',
          moodScore: entry.moodScore,
          energyScore: entry.energyScore,
          date: entry.date,
          promptUsed: entry.promptUsed,
          error: true,
        };
      }
    });

    res.json(decryptedEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get previous answers for a specific prompt (Premium Only)
 * @route   GET /api/journal/prompt
 * @access  Private
 */
export const getAnswersForPrompt = async (req, res) => {
  const userId = req.user._id;
  const { prompt } = req.query;

  if (!req.user.isPremium) {
    return res.status(403).json({ message: 'This feature is only available for premium members.' });
  }

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt parameter is required.' });
  }

  try {
    const journalEntries = await Journal.find({
      userId,
      promptUsed: prompt,
    }).sort({ date: -1 });

    const decryptedEntries = journalEntries.map((entry) => {
      try {
        const decryptedContent = decrypt(entry.encryptedContent, entry.iv, entry.authTag);
        return {
          id: entry._id,
          content: decryptedContent,
          moodScore: entry.moodScore,
          energyScore: entry.energyScore,
          date: entry.date,
          promptUsed: entry.promptUsed,
        };
      } catch (error) {
        return {
          id: entry._id,
          content: 'Error decrypting content.',
          moodScore: entry.moodScore,
          energyScore: entry.energyScore,
          date: entry.date,
          promptUsed: entry.promptUsed,
          error: true,
        };
      }
    });

    res.json(decryptedEntries);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Export all user data as JSON (Premium Only)
 * @route   GET /api/journal/export
 * @access  Private
 */
export const exportJournalData = async (req, res) => {
  const userId = req.user._id;

  if (!req.user.isPremium) {
    return res.status(403).json({ message: 'Export is only available for premium members.' });
  }

  try {
    const journalEntries = await Journal.find({ userId }).sort({ date: -1 });

    const decryptedEntries = journalEntries.map((entry) => {
      try {
        const decryptedContent = decrypt(entry.encryptedContent, entry.iv, entry.authTag);
        return {
          id: entry._id,
          content: decryptedContent,
          moodScore: entry.moodScore,
          energyScore: entry.energyScore,
          date: entry.date,
          promptUsed: entry.promptUsed,
          createdAt: entry.createdAt,
        };
      } catch (error) {
        return {
          id: entry._id,
          content: '[Decryption Error]',
          moodScore: entry.moodScore,
          energyScore: entry.energyScore,
          date: entry.date,
          promptUsed: entry.promptUsed,
          createdAt: entry.createdAt,
          error: true,
        };
      }
    });

    const exportData = {
      user: {
        id: userId,
        email: req.user.email,
        isPremium: req.user.isPremium,
        createdAt: req.user.createdAt,
      },
      exportDate: new Date().toISOString(),
      totalEntries: decryptedEntries.length,
      entries: decryptedEntries,
      statistics: {
        averageMood: decryptedEntries.length > 0 ? (decryptedEntries.reduce((sum, e) => sum + e.moodScore, 0) / decryptedEntries.length).toFixed(2) : 0,
        averageEnergy: decryptedEntries.length > 0 ? (decryptedEntries.reduce((sum, e) => sum + e.energyScore, 0) / decryptedEntries.length).toFixed(2) : 0,
        dateRange: decryptedEntries.length > 0 ? {
          from: new Date(Math.min(...decryptedEntries.map(e => new Date(e.date).getTime()))).toISOString().split('T')[0],
          to: new Date(Math.max(...decryptedEntries.map(e => new Date(e.date).getTime()))).toISOString().split('T')[0],
        } : null,
      },
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
