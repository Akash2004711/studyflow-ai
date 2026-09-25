import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, Check } from 'lucide-react';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/**
 * QuizQuestion Component
 * Renders an individual multiple choice question with 4 options, selection validation,
 * instant educational feedback, and next-step transition.
 */
export default function QuizQuestion({
  questionData,
  questionNumber,
  totalQuestions,
  onAnswerSubmitted,
  isLastQuestion,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Reset local state when moving to a new question
  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setValidationError('');
  }, [questionData]);

  const handleSelectOption = (index) => {
    if (isSubmitted) return; // Prevent changing after submission
    setSelectedOption(index);
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption === null) {
      setValidationError('Please select an option before submitting your answer.');
      return;
    }

    setIsSubmitted(true);
    setValidationError('');
  };

  const handleAdvance = () => {
    const isCorrect = selectedOption === questionData.correctAnswer;
    onAnswerSubmitted({
      questionId: questionData.id,
      question: questionData.question,
      options: questionData.options,
      selectedOption,
      correctAnswer: questionData.correctAnswer,
      isCorrect,
      explanation: questionData.explanation,
    });
  };

  const isCorrect = selectedOption === questionData.correctAnswer;

  return (
    <div className="quiz-question-container">
      <h3 className="quiz-question-prompt">
        {questionNumber}. {questionData.question}
      </h3>

      <div className="quiz-options-list" role="radiogroup" aria-label={`Options for question ${questionNumber}`}>
        {questionData.options.map((optionText, index) => {
          let optionClass = 'quiz-option-btn';

          if (isSubmitted) {
            if (index === questionData.correctAnswer) {
              optionClass += ' correct';
            } else if (index === selectedOption) {
              optionClass += ' incorrect';
            }
          } else if (selectedOption === index) {
            optionClass += ' selected';
          }

          return (
            <button
              key={index}
              type="button"
              className={optionClass}
              onClick={() => handleSelectOption(index)}
              disabled={isSubmitted}
              role="radio"
              aria-checked={selectedOption === index}
            >
              <div className="option-marker">
                {isSubmitted && index === questionData.correctAnswer ? (
                  <Check size={14} />
                ) : (
                  OPTION_LETTERS[index]
                )}
              </div>
              <span className="option-text">{optionText}</span>
            </button>
          );
        })}
      </div>

      {validationError && (
        <p className="validation-error-msg" role="alert">
          {validationError}
        </p>
      )}

      {/* Immediate post-submission feedback */}
      {isSubmitted && (
        <div className={`feedback-banner ${isCorrect ? 'correct' : 'incorrect'}`} role="alert">
          <div className="feedback-status">
            {isCorrect ? (
              <>
                <CheckCircle size={18} />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <XCircle size={18} />
                <span>Incorrect</span>
              </>
            )}
          </div>
          <p className="feedback-explanation">
            <strong>Explanation:</strong> {questionData.explanation}
          </p>
        </div>
      )}

      <div className="quiz-footer-actions">
        {!isSubmitted ? (
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            <span>Submit Answer</span>
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={handleAdvance}>
            <span>{isLastQuestion ? 'View Results' : 'Next Question'}</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
