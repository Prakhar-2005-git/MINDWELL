import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const MoodChart = ({ entries, user }) => {
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

  // Filter entries based on premium status
  const filteredEntries = user?.isPremium 
    ? entries 
    : entries.filter(entry => isWithinCurrentWeek(entry.date || entry.createdAt));

  const recent = filteredEntries.slice(-7);
  const hasData = recent.length > 0;
  const labels = hasData ? recent.map((entry) => new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const scores = hasData ? recent.map((entry) => entry.moodScore) : [5, 6, 5, 7, 6, 8, 7];
  const emotionCounts = hasData ? [filteredEntries.filter(e => e.moodScore >= 8).length, filteredEntries.filter(e => e.moodScore >= 5 && e.moodScore < 8).length, filteredEntries.filter(e => e.moodScore < 5).length] : [4, 2, 1];
  const baseOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#4b5146', font: { family: 'Inter' } } } } };
  return <div className="chart-grid"><article className="chart-card"><div className="chart-heading"><div><p className="eyebrow">YOUR RHYTHM</p><h2>Mood over time</h2></div><span>{hasData ? 'Last 7 entries' : 'Sample view'}</span></div><div className="chart-canvas"><Line data={{ labels, datasets: [{ label: 'Mood score', data: scores, borderColor: '#687d6a', backgroundColor: 'rgba(104, 125, 106, .14)', fill: true, tension: .38, pointBackgroundColor: '#c97f63', pointRadius: 4 }] }} options={{ ...baseOptions, scales: { x: { grid: { display: false }, ticks: { color: '#707568' } }, y: { min: 0, max: 10, ticks: { stepSize: 2, color: '#707568' }, grid: { color: 'rgba(75,81,70,.12)' } } } }} /></div></article><article className="chart-card pie-card"><div className="chart-heading"><div><p className="eyebrow">A LITTLE PERSPECTIVE</p><h2>Most common emotions</h2></div></div><div className="chart-canvas"><Pie data={{ labels: ['Uplifted', 'Steady', 'Low'], datasets: [{ data: emotionCounts, backgroundColor: ['#7f987b', '#d7bca4', '#c97f63'], borderWidth: 0, hoverOffset: 5 }] }} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { position: 'bottom', labels: { color: '#4b5146', padding: 18, usePointStyle: true } } } }} /></div></article></div>;
};
export default MoodChart;
