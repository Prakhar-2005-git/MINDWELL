import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  },
  // --- ENCRYPTED FIELDS ---
  encryptedContent: {
    type: String,
    required: true
  },
  iv: {
    type: String, 
    required: true
  },
  authTag: {
    type: String, 
    required: true
  },
  // --- PLAINTEXT ANALYTICS FIELDS ---
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  energyScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  promptUsed: {
    type: String, // The daily prompt they answered, kept plaintext for context
    default: null
  },
  date: {
    type: Date,
    default: Date.now,
    index: true // Indexed to optimize time-series queries for Chart.js
  }
});

export default mongoose.model('Journal', journalSchema);
