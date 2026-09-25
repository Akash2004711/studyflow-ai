import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import Flashcard from './Flashcard.jsx';
import ProgressBar from './ProgressBar.jsx';

/**
 * FlashcardSection Component
 * Manages active card index, navigation boundaries, progress bar, and keyboard shortcuts.
 */
export default function FlashcardSection({ flashcards = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const totalCards = flashcards.length;

  // Reset index and reveal state whenever the underlying flashcard set changes (e.g. new generation)
  useEffect(() => {
    setCurrentIndex(0);
    setIsAnswerRevealed(false);
  }, [flashcards]);

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
          <Layers size={20} color="var(--primary)" />
          <h2 id="flashcards-heading" className="section-title">
            Interactive Flashcards
          </h2>
        </div>
        <div className="section-counter" aria-label={`Card ${currentIndex + 1} of ${totalCards}`}>
          {currentIndex + 1} / {totalCards}
        </div>
      </div>

      <ProgressBar current={currentIndex + 1} total={totalCards} label="Flashcard progress" />

      <Flashcard
        card={currentCard}
        isAnswerRevealed={isAnswerRevealed}
        onToggleAnswer={handleToggleAnswer}
      />

      <div className="flashcard-actions">
        <div className="flashcard-nav-group" style={{ width: '100%', justifyContent: 'space-between' }}>
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

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Card {currentIndex + 1} of {totalCards}
          </span>

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
