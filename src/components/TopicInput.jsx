import React, { useState } from 'react';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import StudyConfig from './StudyConfig.jsx';

const SUGGESTIONS = [
  'JavaScript Closures for beginners',
  'React useEffect vs useLayoutEffect',
  'REST vs GraphQL APIs',
  'Binary Search Algorithm concepts',
];

const MAX_CHAR_LIMIT = 5000;

/**
 * TopicInput Component
 * Allows free-form study input, validates client-side limits, and triggers generation.
 */
export default function TopicInput({
  onGenerate,
  isLoading,
  difficulty,
  onDifficultyChange,
  flashcardCount,
  onFlashcardCountChange,
  quizCount,
  onQuizCountChange,
}) {
  const [input, setInput] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Clear validation error if user fixes input
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
    <section className="input-card" aria-labelledby="input-heading">
      <div className="input-header">
        <h2 id="input-heading" className="input-title">
          What would you like to master today?
        </h2>
        <p className="input-subtitle">
          Enter any topic, paste lecture notes, or ask a question to generate instant flashcards & quizzes.
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
            placeholder="Example: Explain JavaScript closures for a beginner..."
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
              {charCount} / {MAX_CHAR_LIMIT}
            </span>
          </div>

          {validationError && (
            <div id="input-error-msg" className="validation-error-msg" role="alert">
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Study Configuration Panel */}
        <StudyConfig
          difficulty={difficulty}
          onDifficultyChange={onDifficultyChange}
          flashcardCount={flashcardCount}
          onFlashcardCountChange={onFlashcardCountChange}
          quizCount={quizCount}
          onQuizCountChange={onQuizCountChange}
          disabled={isLoading}
        />

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
            className="btn-primary"
            disabled={isLoading || isOverLimit}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="spinner-pulse" style={{ width: 18, height: 18, borderWidth: 2 }} />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Study Session</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
