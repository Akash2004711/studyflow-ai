import React, { useState, useEffect } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';
import ProgressBar from './ProgressBar.jsx';
import QuizQuestion from './QuizQuestion.jsx';
import QuizResult from './QuizResult.jsx';

/**
 * Quiz Component
 * Manages the interactive quiz state lifecycle: single question presentation,
 * score computation, results review, and targeted retries for incorrect answers.
 */
export default function Quiz({ initialQuestions = [] }) {
  const [activeQuestions, setActiveQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false);

  // Sync state whenever new study material is generated
  useEffect(() => {
    setActiveQuestions(initialQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setIsCompleted(false);
    setIsRetryMode(false);
  }, [initialQuestions]);

  const totalQuestions = activeQuestions.length;

  const handleAnswerSubmitted = (answerRecord) => {
    const updatedAnswers = [...answers, answerRecord];
    setAnswers(updatedAnswers);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Start a focused quiz session containing only the missed questions
  const handleRetryWrong = () => {
    const wrongAnswers = answers.filter((a) => !a.isCorrect);
    const wrongQuestionIds = new Set(wrongAnswers.map((a) => a.questionId));
    const wrongQuestions = initialQuestions.filter((q) => wrongQuestionIds.has(q.id));

    if (wrongQuestions.length > 0) {
      setActiveQuestions(wrongQuestions);
      setCurrentIndex(0);
      setAnswers([]);
      setIsCompleted(false);
      setIsRetryMode(true);
    }
  };

  // Restart the full quiz from question 1
  const handleRestartFullQuiz = () => {
    setActiveQuestions(initialQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setIsCompleted(false);
    setIsRetryMode(false);
  };

  if (!initialQuestions || initialQuestions.length === 0) {
    return null;
  }

  const currentQuestion = activeQuestions[currentIndex];

  return (
    <section className="quiz-section" aria-labelledby="quiz-heading">
      <div className="section-header">
        <div className="section-title-group">
          <HelpCircle size={20} color="var(--accent-cyan)" />
          <h2 id="quiz-heading" className="section-title">
            {isRetryMode ? 'Missed Questions Review Quiz' : 'Knowledge Check Quiz'}
          </h2>
        </div>
        {!isCompleted && (
          <div
            className="section-counter"
            aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}
          >
            {currentIndex + 1} / {totalQuestions}
          </div>
        )}
      </div>

      {!isCompleted && (
        <ProgressBar
          current={currentIndex + 1}
          total={totalQuestions}
          label="Quiz completion progress"
        />
      )}

      {!isCompleted && currentQuestion ? (
        <QuizQuestion
          key={currentQuestion.id || currentIndex}
          questionData={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          onAnswerSubmitted={handleAnswerSubmitted}
          isLastQuestion={currentIndex === totalQuestions - 1}
        />
      ) : (
        <QuizResult
          results={answers}
          onRetryWrong={handleRetryWrong}
          onRestartFullQuiz={handleRestartFullQuiz}
          isRetryMode={isRetryMode}
        />
      )}
    </section>
  );
}
