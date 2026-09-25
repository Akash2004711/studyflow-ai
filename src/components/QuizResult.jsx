import React from 'react';
import { Award, RotateCcw, CheckCircle2, XCircle, Sparkles, BookOpen } from 'lucide-react';

/**
 * QuizResult Component
 * Shows score overview, percentage, retry actions, and detailed question-by-question breakdown.
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

  return (
    <div className="result-card">
      <div className="score-overview">
        <div className="score-circle">
          <span className="score-fraction">
            {correctCount}/{total}
          </span>
          <span className="score-percent">{percentage}%</span>
        </div>

        <h3 className="score-heading">{feedback.title}</h3>
        <p className="score-message">{feedback.description}</p>

        {isRetryMode && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent-cyan)',
              background: 'var(--primary-light)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            Completed Missed Questions Review
          </div>
        )}
      </div>

      <div className="result-actions">
        {incorrectCount > 0 ? (
          <button type="button" className="btn-primary" onClick={onRetryWrong}>
            <RotateCcw size={16} />
            <span>Retry Wrong Answers ({incorrectCount})</span>
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--success)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={18} />
            <span>There are no incorrect questions to retry!</span>
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
                <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
              ) : (
                <XCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
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
              <strong>Explanation:</strong> {item.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
