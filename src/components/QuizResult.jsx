import React, { useState, useEffect } from 'react';
import { Award, RotateCcw, CheckCircle2, XCircle, Sparkles, BookOpen } from 'lucide-react';

/**
 * QuizResult Component
 * Shows score overview with animated score count-up, SVG circular indicator, retry actions, and detailed review.
 */
export default function QuizResult({
  results = [],
  onRetryWrong,
  onRestartFullQuiz,
  isRetryMode = false,
}) {
  const total = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const incorrectCount = total - correctCount;

  // Animated score ticker state
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // If reduced motion is preferred, jump straight to target
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimatedScore(correctCount);
      return;
    }

    setAnimatedScore(0);
    if (correctCount === 0) return;

    let current = 0;
    const duration = 600; // ms
    const stepTime = Math.max(Math.floor(duration / correctCount), 50);

    const timer = setInterval(() => {
      current += 1;
      setAnimatedScore(current);
      if (current >= correctCount) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [correctCount]);

  const getFeedbackMessage = () => {
    if (percentage === 100) {
      return {
        title: 'Perfect Score! 🌟',
        description: 'Outstanding mastery! You answered all questions correctly.',
      };
    }
    if (percentage >= 80) {
      return {
        title: 'Great Work! 🎉',
        description: 'You have a solid grasp of this study material.',
      };
    }
    if (percentage >= 60) {
      return {
        title: 'Good Effort! 👍',
        description: 'You are on the right track. Review the missed concepts below to solidify your understanding.',
      };
    }
    return {
      title: 'Keep Practicing! 💪',
      description: 'Review the explanations below and try retrying the questions you missed.',
    };
  };

  const feedback = getFeedbackMessage();
  const strokeDashoffset = 283 - (283 * percentage) / 100;

  return (
    <div className="result-card 3d-tilt-card">
      <div className="score-overview">
        {/* SVG Circular Animated Progress Meter */}
        <div className="score-circle-wrapper">
          <svg className="score-ring-svg" viewBox="0 0 100 100">
            <circle className="score-ring-bg" cx="50" cy="50" r="45" />
            <circle
              className="score-ring-fill"
              cx="50"
              cy="50"
              r="45"
              style={{ strokeDashoffset }}
            />
          </svg>
          <div className="score-circle-content">
            <span className="score-fraction">
              {animatedScore}/{total}
            </span>
            <span className="score-percent">{percentage}%</span>
          </div>
        </div>

        <h3 className="score-heading">{feedback.title}</h3>
        <p className="score-message">{feedback.description}</p>

        {isRetryMode && (
          <div className="retry-mode-pill">
            Completed Missed Questions Review
          </div>
        )}
      </div>

      <div className="result-actions">
        {incorrectCount > 0 ? (
          <button type="button" className="btn-primary btn-cta-3d" onClick={onRetryWrong}>
            <RotateCcw size={16} />
            <span>↻ Retry Wrong Answers ({incorrectCount})</span>
          </button>
        ) : (
          <div className="perfect-score-banner">
            <CheckCircle2 size={18} />
            <span>✓ Perfect Score! Nothing to retry.</span>
          </div>
        )}

        <button type="button" className="btn-secondary" onClick={onRestartFullQuiz}>
          <BookOpen size={16} />
          <span>Retake Full Quiz</span>
        </button>
      </div>

      {/* Question-by-Question Review */}
      <div className="review-list">
        <h4 className="review-list-title">Detailed Question Review</h4>

        {results.map((item, idx) => (
          <div
            key={item.questionId || idx}
            className={`review-item ${item.isCorrect ? 'was-correct' : 'was-incorrect'}`}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              {item.isCorrect ? (
                <CheckCircle2 size={18} className="stat-icon-success" style={{ flexShrink: 0, marginTop: 2 }} />
              ) : (
                <XCircle size={18} className="stat-icon-danger" style={{ flexShrink: 0, marginTop: 2 }} />
              )}
              <div className="review-question">
                Question {idx + 1}: {item.question}
              </div>
            </div>

            <div className="review-answers-grid">
              <div className={`review-user-ans ${!item.isCorrect ? 'incorrect' : ''}`}>
                <strong>Your Answer:</strong>{' '}
                {item.selectedOption !== null && item.options ? item.options[item.selectedOption] : 'None'}
              </div>

              {!item.isCorrect && (
                <div className="review-correct-ans">
                  <strong>Correct Answer:</strong> {item.options ? item.options[item.correctAnswer] : ''}
                </div>
              )}
            </div>

            <div className="review-explanation">
              <strong>Why?</strong> {item.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

