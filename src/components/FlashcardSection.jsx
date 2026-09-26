import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Layers, Eye } from 'lucide-react';
import Flashcard from './Flashcard.jsx';
import ProgressBar from './ProgressBar.jsx';

/**
 * FlashcardSection Component
 * Manages active card index, navigation boundaries, progress bar, and keyboard shortcuts (Arrow keys / Space).
 */
export default function FlashcardSection({ flashcards = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const totalCards = flashcards.length;

  useEffect(() => {
    setCurrentIndex(0);
    setIsAnswerRevealed(false);
  }, [flashcards]);

  // Keyboard navigation support (ArrowLeft, ArrowRight, Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in textarea or input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setIsAnswerRevealed(false);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < totalCards - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsAnswerRevealed(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalCards]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsAnswerRevealed(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswerRevealed(false);
    }
  };

  const handleToggleAnswer = () => {
    setIsAnswerRevealed((prev) => !prev);
  };

  if (!flashcards || flashcards.length === 0) {
    return null;
  }

  const currentCard = flashcards[currentIndex];

  return (
    <section className="flashcards-section" aria-labelledby="flashcards-heading">
      <div className="section-header">
        <div className="section-title-group">
          <Layers size={20} className="stat-icon-primary" />
          <h2 id="flashcards-heading" className="section-title">
            Interactive 3D Flashcards
          </h2>
        </div>
        <div className="section-counter" aria-label={`Card ${currentIndex + 1} of ${totalCards}`}>
          Card {currentIndex + 1} of {totalCards}
        </div>
      </div>

      <ProgressBar current={currentIndex + 1} total={totalCards} label="Flashcard progress" />

      <Flashcard
        card={currentCard}
        isAnswerRevealed={isAnswerRevealed}
        onToggleAnswer={handleToggleAnswer}
      />

      {/* Visual Dot Progress Bar */}
      <div className="flashcard-dots-progress" aria-hidden="true">
        {flashcards.map((_, idx) => (
          <span
            key={idx}
            className={`progress-dot ${idx === currentIndex ? 'active' : idx < currentIndex ? 'completed' : ''}`}
            onClick={() => {
              setCurrentIndex(idx);
              setIsAnswerRevealed(false);
            }}
          />
        ))}
      </div>

      <div className="flashcard-actions">
        <div className="flashcard-nav-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous flashcard"
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>

          <button
            type="button"
            className="btn-secondary btn-reveal-nav"
            onClick={handleToggleAnswer}
            aria-label="Toggle answer"
          >
            <Eye size={16} />
            <span>{isAnswerRevealed ? 'Show Front' : 'Reveal Answer'}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleNext}
            disabled={currentIndex === totalCards - 1}
            aria-label="Next flashcard"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

