import express from 'express';
import { createJournalEntry, getJournalEntries, getAnswersForPrompt, exportJournalData } from '../controllers/journalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createJournalEntry).get(protect, getJournalEntries);
router.route('/prompt').get(protect, getAnswersForPrompt);
router.route('/export').get(protect, exportJournalData);

export default router;
