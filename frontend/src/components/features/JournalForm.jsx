import React, { useMemo, useState } from 'react';
import { DAILY_PROMPTS } from '../../constants/dailyPrompts';

const JournalForm = ({ onNewEntry, selectedPrompt = null, dailyPrompts = DAILY_PROMPTS }) => {
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(5);
  const [energyScore, setEnergyScore] = useState(5);
  const [error, setError] = useState('');

  const displayPrompt = selectedPrompt || (
    Array.isArray(dailyPrompts) && dailyPrompts.length > 0
      ? dailyPrompts[new Date().getDate() % dailyPrompts.length]
      : 'What would you like to capture today?'
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setError('Write a few words before saving.');
      return;
    }

    try {
      setError('');
      await onNewEntry({
        content,
        moodScore,
        energyScore,
        promptUsed: displayPrompt,
      });
      setContent('');
      setMoodScore(5);
      setEnergyScore(5);
    } catch {
      setError('Your entry could not be saved. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="journal-form">
      <div className="journal-form-heading">
        <div>
          <p className="eyebrow">YOUR ANSWER</p>
          <h2>{displayPrompt}</h2>
        </div>
        <span>Private &amp; secure</span>
      </div>

      {error && <p className="error-message">{error}</p>}

      <textarea
        aria-label="Your journal entry"
        rows="5"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Let your thoughts arrive without judgement…"
      />

      <div className="journal-controls">
        <label>
          Mood <b>{moodScore}/10</b>
          <input
            type="range"
            min="1"
            max="10"
            value={moodScore}
            onChange={(e) => setMoodScore(Number(e.target.value))}
          />
        </label>
        <label>
          Energy <b>{energyScore}/10</b>
          <input
            type="range"
            min="1"
            max="10"
            value={energyScore}
            onChange={(e) => setEnergyScore(Number(e.target.value))}
          />
        </label>
        <button className="button">Save reflection</button>
      </div>
    </form>
  );
};

export default JournalForm;
