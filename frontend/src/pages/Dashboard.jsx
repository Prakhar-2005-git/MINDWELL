import React, { useState, useEffect, useContext } from 'react';
import { getJournalEntries, createJournalEntry, exportJournalData } from '../service/journalService';
import MoodChart from '../components/features/MoodChart';
import JournalList from '../components/features/JournalList';
import JournalForm from '../components/features/JournalForm';
import DailyPromptSpinner from '../components/features/DailyPromptSpinner';
import BrainBackdrop from '../components/BrainBackdrop';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchJournalData = async () => {
    try {
      setError('');
      setLoading(true);
      setJournalEntries(await getJournalEntries());
    } catch {
      setError('Failed to load your journal entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalData();
  }, []);

  const handleNewEntry = async (entryData) => {
    await createJournalEntry(entryData);
    await fetchJournalData();
  };

  const handlePromptSelected = (prompt) => {
    setSelectedPrompt(prompt);
    // Scroll to journal form
    const formElement = document.querySelector('.journal-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      await exportJournalData();
    } catch (err) {
      setError('Failed to export your data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) return <div className="page-state">Preparing your private space…</div>;

  return (
    <section className="dashboard-page">
      <div className="dashboard-intro">
        <BrainBackdrop />
        <div>
          <p className="eyebrow">YOUR PRIVATE SPACE</p>
          <h1>How are you arriving<br />today?</h1>
          <p>There is no right way to feel. Begin wherever you are.</p>
        </div>
        <div className="intro-tip">
          <b>A small reminder</b>
          <p>One honest sentence is enough.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <DailyPromptSpinner onPromptSelected={handlePromptSelected} />
      
      <JournalForm onNewEntry={handleNewEntry} selectedPrompt={selectedPrompt} />
      
      <MoodChart entries={journalEntries} user={user} />
      
      <section className="journal-history">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <p className="eyebrow">YOUR REFLECTIONS</p>
            <h2>Journal history</h2>
          </div>
          {user?.isPremium && (
            <button
              className="button"
              onClick={handleExportData}
              disabled={exportLoading}
              style={{ alignSelf: 'flex-start' }}
            >
              {exportLoading ? 'Exporting...' : 'Export Data'}
            </button>
          )}
        </div>
        <JournalList entries={journalEntries} user={user} />
      </section>
    </section>
  );
};

export default Dashboard;
