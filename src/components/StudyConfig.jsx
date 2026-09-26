import React from 'react';
import { Sliders } from 'lucide-react';

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const COUNT_OPTIONS = [3, 5, 7, 10];

/**
 * StudyConfig Component
 * Provides interactive panel controls for selecting difficulty level,
 * flashcard count, and quiz question count prior to generating a session.
 */
export default function StudyConfig({
  difficulty,
  onDifficultyChange,
  flashcardCount,
  onFlashcardCountChange,
  quizCount,
  onQuizCountChange,
  disabled,
}) {
  return (
    <div className="study-config-panel" aria-label="Study Session Configuration">
      <div className="config-group">
        <label className="config-label" id="difficulty-group-label">
          Difficulty Level
        </label>
        <div className="config-pill-group" role="radiogroup" aria-labelledby="difficulty-group-label">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`config-pill ${difficulty === opt.value ? 'active' : ''}`}
              onClick={() => onDifficultyChange(opt.value)}
              disabled={disabled}
              role="radio"
              aria-checked={difficulty === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="config-group">
        <label className="config-label" id="flashcard-count-label">
          Flashcard Count
        </label>
        <div className="config-pill-group" role="radiogroup" aria-labelledby="flashcard-count-label">
          {COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              className={`config-pill ${flashcardCount === count ? 'active' : ''}`}
              onClick={() => onFlashcardCountChange(count)}
              disabled={disabled}
              role="radio"
              aria-checked={flashcardCount === count}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="config-group">
        <label className="config-label" id="quiz-count-label">
          Quiz Question Count
        </label>
        <div className="config-pill-group" role="radiogroup" aria-labelledby="quiz-count-label">
          {COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              className={`config-pill ${quizCount === count ? 'active' : ''}`}
              onClick={() => onQuizCountChange(count)}
              disabled={disabled}
              role="radio"
              aria-checked={quizCount === count}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
