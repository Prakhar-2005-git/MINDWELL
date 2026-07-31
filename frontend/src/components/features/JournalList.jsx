import React, { useMemo, useState } from 'react';

const JournalList = ({ entries, user }) => {
  const [searchDate, setSearchDate] = useState('');
  const [searchPrompt, setSearchPrompt] = useState('');

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const isSameDay = (leftDate, rightDate) => {
    const left = new Date(leftDate);
    const right = new Date(rightDate);

    if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) {
      return false;
    }

    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  };

  const isWithinCurrentWeek = (dateString) => {
    try {
      const entryDate = new Date(dateString);
      if (Number.isNaN(entryDate.getTime())) {
        return false;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);

      const weekEnd = new Date(today);
      weekEnd.setHours(23, 59, 59, 999);

      return entryDate >= weekStart && entryDate <= weekEnd;
    } catch (err) {
      return false;
    }
  };

  const weekDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));
      return day;
    });
  }, []);

  const normalizedEntries = useMemo(() => {
    return [...(entries || [])]
      .filter(Boolean)
      .sort((leftEntry, rightEntry) => {
        const leftDate = new Date(leftEntry.date || leftEntry.createdAt || 0).getTime();
        const rightDate = new Date(rightEntry.date || rightEntry.createdAt || 0).getTime();
        return rightDate - leftDate;
      });
  }, [entries]);

  const currentWeekEntries = useMemo(() => {
    return normalizedEntries.filter((entry) => isWithinCurrentWeek(entry.date || entry.createdAt));
  }, [normalizedEntries]);

  const visibleEntries = useMemo(() => {
    if (!user?.isPremium) {
      return currentWeekEntries;
    }

    return normalizedEntries.filter((entry) => {
      const entryDate = entry.date || entry.createdAt;
      const matchesDate = !searchDate || isSameDay(entryDate, searchDate);
      const matchesPrompt =
        !searchPrompt || (entry.promptUsed || '').toLowerCase().includes(searchPrompt.toLowerCase());
      return matchesDate && matchesPrompt;
    });
  }, [currentWeekEntries, normalizedEntries, searchDate, searchPrompt, user?.isPremium]);

  if (!entries || entries.length === 0) {
    return <p>You have no journal entries yet.</p>;
  }

  const hasOlderEntries = normalizedEntries.some((entry) => !isWithinCurrentWeek(entry.date || entry.createdAt));
  const showWeeklyView = !user?.isPremium;

  const renderEntryCard = (entry, showDateHeader = false) => (
    <div key={entry.id || entry._id} style={{ padding: '1.5rem' }}>
      {showDateHeader && <h3 style={{ margin: '0 0 1rem 0' }}>{formatDate(entry.date || entry.createdAt)}</h3>}
      <p>{entry.content}</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <span>Mood: {entry.moodScore}/10</span>
        <span>Energy: {entry.energyScore}/10</span>
      </div>
      {entry.promptUsed && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
          Prompt: {entry.promptUsed}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {user?.isPremium && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '180px' }}>
            <span style={{ fontSize: '0.9rem' }}>Filter by date</span>
            <input type="date" value={searchDate} onChange={(event) => setSearchDate(event.target.value)} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '220px' }}>
            <span style={{ fontSize: '0.9rem' }}>Filter by prompt</span>
            <input
              type="text"
              value={searchPrompt}
              placeholder="Search prompt"
              onChange={(event) => setSearchPrompt(event.target.value)}
            />
          </label>
        </div>
      )}

      {showWeeklyView ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {weekDays.map((day) => {
            const matchingEntry = currentWeekEntries.find((entry) => isSameDay(entry.date || entry.createdAt, day));

            return (
              <div key={day.toISOString()} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: matchingEntry ? '1px solid rgba(0,0,0,0.1)' : 'none' }}>
                  <h3 style={{ margin: 0 }}>{formatDate(day)}</h3>
                </div>
                {matchingEntry ? (
                  renderEntryCard(matchingEntry)
                ) : (
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <p style={{ color: 'var(--muted)', margin: 0 }}>No data</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visibleEntries.length === 0 ? (
            <p>No entries match these filters yet.</p>
          ) : (
            visibleEntries.map((entry) => (
              <div key={entry.id || entry._id} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem' }}>
                {renderEntryCard(entry, true)}
              </div>
            ))
          )}
        </div>
      )}

      {!user?.isPremium && (
        <div style={{ backgroundColor: 'var(--cream)', padding: '1.5rem', borderRadius: '1rem', border: '2px solid var(--ink)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            <strong>Browse All Your Prompts</strong>
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Premium members can view all previous journal entries and search by date or prompt to revisit their growth journey.
          </p>
          <button style={{ backgroundColor: 'var(--ink)', color: 'var(--cream)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }}>
            Become Premium
          </button>
        </div>
      )}
    </div>
  );
};

export default JournalList;
