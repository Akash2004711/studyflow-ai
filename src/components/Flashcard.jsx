import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Flashcard Component
 * Renders an individual flashcard with question, revealable answer, and accessible toggle.
 */
export default function Flashcard({
  card,
  isAnswerRevealed,
  onToggleAnswer,
}) {
  if (!card) return null;

  return (
    <article className="flashcard-box" aria-live="polite">
      <div>
        <div className="flashcard-label">Concept Prompt</div>
        <p className="flashcard-content">{card.question}</p>
      </div>

      {isAnswerRevealed && (
        <div className="flashcard-answer-box">
          <div className="flashcard-label" style={{ color: 'var(--accent-cyan)' }}>
            Explanation / Answer
          </div>
          <p className="flashcard-answer-text">{card.answer}</p>
        </div>
      )}

      <div style={{ marginTop: '1.25rem' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={onToggleAnswer}
          aria-expanded={isAnswerRevealed}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {isAnswerRevealed ? (
            <>
              <EyeOff size={16} />
              <span>Hide Answer</span>
            </>
          ) : (
            <>
              <Eye size={16} />
              <span>Reveal Answer</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
