import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const SUGGESTIONS = [
  'JavaScript Closures for beginners',
  'React useEffect vs useLayoutEffect',
  'REST vs GraphQL APIs',
  'Binary Search Algorithm concepts',
];

const MAX_CHAR_LIMIT = 5000;

/**
 * TopicInput Component
 * Large premium 3D input card with character counter, focus glow, 3D mouse tilt, and smooth CTA.
 */
export default function TopicInput({ onGenerate, isLoading }) {
  const [input, setInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      setTilt({ x: rotateX.toFixed(2), y: rotateY.toFixed(2) });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (validationError && value.trim().length > 0) {
      setValidationError('');
    }
  };

  const handleChipClick = (suggestion) => {
    setInput(suggestion);
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = input.trim();

    if (!trimmed) {
      setValidationError('Please enter a topic, question, or study notes.');
      return;
    }

    if (trimmed.length < 3) {
      setValidationError('Please enter at least 3 characters for a meaningful study set.');
      return;
    }

    if (trimmed.length > MAX_CHAR_LIMIT) {
      setValidationError(`Input exceeds maximum allowed limit of ${MAX_CHAR_LIMIT} characters.`);
      return;
    }

    setValidationError('');
    onGenerate(trimmed);
  };

  const charCount = input.length;
  const isNearLimit = charCount > MAX_CHAR_LIMIT * 0.85;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;

  return (
    <section
      ref={cardRef}
      className="input-card 3d-tilt-card"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      aria-labelledby="input-heading"
    >
      <div className="input-header">
        <h2 id="input-heading" className="input-title">
          What do you want to learn today?
        </h2>
        <p className="input-subtitle">
          Paste your study notes, concepts, or topic to generate interactive flashcards & quiz questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="input-wrapper">
          <label htmlFor="study-topic-input" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
            Study Topic or Notes
          </label>
          <textarea
            id="study-topic-input"
            className="study-textarea"
            placeholder="Paste notes, concepts, or topic prompt (e.g. JavaScript closures...)"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            rows={4}
            maxLength={MAX_CHAR_LIMIT + 50}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'input-error-msg' : undefined}
          />

          <div className="input-meta-row">
            <span>Free-form topics, questions, or lecture notes</span>
            <span
              className={`char-counter ${
                isOverLimit ? 'limit-exceeded' : isNearLimit ? 'limit-near' : ''
              }`}
            >
              {charCount} / {MAX_CHAR_LIMIT} characters
            </span>
          </div>

          {validationError && (
            <div id="input-error-msg" className="validation-error-msg" role="alert">
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        <div className="suggestion-chips-wrapper">
          <div className="suggestion-label">Quick Ideas</div>
          <div className="suggestion-chips" role="group" aria-label="Suggested study topics">
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => handleChipClick(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="generate-action-row">
          <button
            type="submit"
            className="btn-primary btn-cta-3d"
            disabled={isLoading || isOverLimit}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="spinner-pulse" style={{ width: 18, height: 18, borderWidth: 2 }} />
                <span>Generating your study experience...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>✦ Generate Study Session</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

