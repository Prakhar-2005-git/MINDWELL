import api from './api';

export const getJournalEntries = async (filters = {}) => {
  try {
    const response = await api.get('/journal', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

export const getPreviousAnswersForPrompt = async (prompt) => {
  try {
    const response = await api.get('/journal/prompt', {
      params: { prompt },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching previous answers:', error);
    throw error;
  }
};

export const exportJournalData = async () => {
  try {
    const response = await api.get('/journal/export');
    const dataStr = JSON.stringify(response.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindwell-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return response.data;
  } catch (error) {
    console.error('Error exporting journal data:', error);
    throw error;
  }
};

export const createJournalEntry = async (entryData) => {
  try {
    const response = await api.post('/journal', entryData);
    return response.data;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

export const updateJournalEntry = async (id, entryData) => {
  try {
    const response = await api.put(`/journal/${id}`, entryData);
    return response.data;
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (id) => {
  try {
    const response = await api.delete(`/journal/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};
