import React, { useState, useEffect, useContext, useRef } from 'react';
import AuthContext from '../../context/AuthContext';
import { getPreviousAnswersForPrompt } from '../../service/journalService';
import { DAILY_PROMPTS } from '../../constants/dailyPrompts';

const DailyPromptSpinner = ({ onPromptSelected }) => {
  const { user } = useContext(AuthContext);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [previousAnswers, setPreviousAnswers] = useState([]);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [showPreviousAnswers, setShowPreviousAnswers] = useState(false);
  const slotRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const currentPrompt = DAILY_PROMPTS[currentPromptIndex];
  const ITEM_HEIGHT = 60; // Height of each slot item

  // Fetch previous answers when prompt changes and user is premium
  useEffect(() => {
    const fetchPreviousAnswers = async () => {
      if (!user?.isPremium) {
        setPreviousAnswers([]);
        return;
      }

      setLoadingPrevious(true);
      try {
        const answers = await getPreviousAnswersForPrompt(currentPrompt);
        setPreviousAnswers(answers || []);
      } catch (error) {
        console.error('Error fetching previous answers:', error);
        setPreviousAnswers([]);
      } finally {
        setLoadingPrevious(false);
      }
    };

    fetchPreviousAnswers();
  }, [currentPrompt, user?.isPremium]);

  // Handle slot machine scroll
  useEffect(() => {
    if (slotRef.current) {
      // Calculate scroll position to center the active item at the pointer
      // We want the active item's center to align with the slot machine's center
      const slotWrapper = slotRef.current.parentElement;
      const SLOT_HEIGHT = slotWrapper?.offsetHeight || 240;
      
      const itemTopInThirdCycle = (DAILY_PROMPTS.length + currentPromptIndex) * ITEM_HEIGHT;
      const scrollPosition = itemTopInThirdCycle + (ITEM_HEIGHT / 2) - (SLOT_HEIGHT / 2);
      slotRef.current.scrollTop = scrollPosition;
    }
  }, [currentPromptIndex]);

  // Handle wheel event for mouse scroll
  const handleWheel = (e) => {
    e.preventDefault();
    if (isScrolling) return;

    const delta = e.deltaY;
    let newIndex = currentPromptIndex;

    if (delta > 0) {
      // Scroll down
      newIndex = (currentPromptIndex + 1) % DAILY_PROMPTS.length;
    } else {
      // Scroll up
      newIndex = (currentPromptIndex - 1 + DAILY_PROMPTS.length) % DAILY_PROMPTS.length;
    }

    setCurrentPromptIndex(newIndex);
    setShowPreviousAnswers(false);
    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 300);
  };

  // Handle touch events for mobile
  let touchStartY = 0;
  const handleTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > 30) {
      let newIndex = currentPromptIndex;
      if (diff > 0) {
        newIndex = (currentPromptIndex + 1) % DAILY_PROMPTS.length;
      } else {
        newIndex = (currentPromptIndex - 1 + DAILY_PROMPTS.length) % DAILY_PROMPTS.length;
      }
      setCurrentPromptIndex(newIndex);
      setShowPreviousAnswers(false);
    }
  };

  const handleSelectPrompt = () => {
    if (onPromptSelected) {
      onPromptSelected(currentPrompt);
    }
  };

  const handleArrowUp = () => {
    const newIndex = (currentPromptIndex - 1 + DAILY_PROMPTS.length) % DAILY_PROMPTS.length;
    setCurrentPromptIndex(newIndex);
    setShowPreviousAnswers(false);
  };

  const handleArrowDown = () => {
    const newIndex = (currentPromptIndex + 1) % DAILY_PROMPTS.length;
    setCurrentPromptIndex(newIndex);
    setShowPreviousAnswers(false);
  };

  // Generate visible prompts (current + 2 above + 2 below for visual effect)
  const getVisiblePrompts = () => {
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentPromptIndex + i + DAILY_PROMPTS.length) % DAILY_PROMPTS.length;
      visible.push({
        index,
        prompt: DAILY_PROMPTS[index],
        offset: i,
      });
    }
    return visible;
  };

  return (
    <div className="slot-machine-container">
      {/* Arrow Up Button */}
      <div className="slot-arrow-buttons">
        <button
          className="slot-arrow-btn"
          onClick={handleArrowUp}
          title="Previous prompt"
          aria-label="Previous prompt"
        >
          ▲
        </button>
      </div>

      <div className="slot-machine-wrapper">
        {/* Slot Machine */}
        <div className="slot-machine">
          <div className="slot-overlay top" />
          <div className="slot-overlay bottom" />

          <div
            className="slot-items"
            ref={slotRef}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Repeat prompts for infinite scroll effect */}
            {[...Array(3)].map((_, cycle) =>
              DAILY_PROMPTS.map((prompt, idx) => (
                <div
                  key={`${cycle}-${idx}`}
                  className={`slot-item ${
                    idx === currentPromptIndex && cycle === 1 ? 'active' : ''
                  }`}
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  <span>{prompt}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pointer */}
        <div className="slot-pointer" />
      </div>

      {/* Arrow Down Button */}
      <div className="slot-arrow-buttons">
        <button
          className="slot-arrow-btn"
          onClick={handleArrowDown}
          title="Next prompt"
          aria-label="Next prompt"
        >
          ▼
        </button>
      </div>

      {/* Selected Prompt Display */}
      <div className="selected-prompt-display">
        <h3 className="prompt-label">Today's Question</h3>
        <p className="prompt-text">{currentPrompt}</p>
      </div>

      {/* Select Button */}
      <div className="slot-controls">
        <button className="slot-select-btn" onClick={handleSelectPrompt}>
          Answer This Prompt
        </button>
      </div>

      {/* Premium Feature: Previous Answers */}
      {user?.isPremium && (
        <div className="premium-section">
          <button
            className={`view-previous-btn ${showPreviousAnswers ? 'active' : ''}`}
            onClick={() => setShowPreviousAnswers(!showPreviousAnswers)}
          >
            {showPreviousAnswers ? 'Hide' : 'View'} Previous Answers
            {previousAnswers.length > 0 && (
              <span className="badge">{previousAnswers.length}</span>
            )}
          </button>

          {showPreviousAnswers && (
            <div className="previous-answers-list">
              {loadingPrevious ? (
                <p className="loading-text">Loading previous answers...</p>
              ) : previousAnswers.length > 0 ? (
                <div className="answers-timeline">
                  {previousAnswers.map((answer, index) => (
                    <div key={index} className="answer-card">
                      <div className="answer-date">
                        {new Date(answer.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="answer-content">
                        <p>{answer.content}</p>
                      </div>
                      <div className="answer-mood">
                        <span className="mood-label">Mood:</span>
                        <span className="mood-score">{answer.moodScore}/10</span>
                        <span className="energy-label">Energy:</span>
                        <span className="energy-score">{answer.energyScore}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-answers-text">
                  No previous answers for this prompt yet.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Non-Premium Notice */}
      {!user?.isPremium && (
        <div className="premium-teaser">
          <p>
             <strong>Upgrade to Premium</strong> to view your previous answers
            and track your growth over time.
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyPromptSpinner;