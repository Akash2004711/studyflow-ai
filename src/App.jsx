import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header.jsx';
import TopicInput from './components/TopicInput.jsx';
import EmptyState from './components/EmptyState.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import StudySummary from './components/StudySummary.jsx';
import FlashcardSection from './components/FlashcardSection.jsx';
import Quiz from './components/Quiz.jsx';
import { generateStudyMaterial } from './services/api.js';
import './App.css';

/**
 * Main StudyFlow AI Application
 */
export default function App() {
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastInput, setLastInput] = useState('');

  // Ref to hold active AbortController for race-condition & stale-response protection
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleGenerate = async (userInput) => {
    if (!userInput || !userInput.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newController = new AbortController();
    abortControllerRef.current = newController;

    setIsLoading(true);
    setError(null);
    setLastInput(userInput);

    try {
      const data = await generateStudyMaterial(userInput, newController.signal);
      setStudyMaterial(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('[StudyFlow] Generation failed:', err);
      setError(err.message || 'We could not generate your study material. Please try again.');
    } finally {
      if (abortControllerRef.current === newController) {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      handleGenerate(lastInput);
    }
  };

  const handleResetNewStudy = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStudyMaterial(null);
    setIsLoading(false);
    setError(null);
    setLastInput('');
  };

  return (
    <div className="app-container">
      {/* Background ambient radial lighting and mesh gradient */}
      <div className="ambient-background" aria-hidden="true" />

      <Header onNewStudy={handleResetNewStudy} hasActiveSession={!!studyMaterial || isLoading} />

      <main className="main-content">
        {/* Input Area */}
        <TopicInput onGenerate={handleGenerate} isLoading={isLoading} />

        {/* Dynamic Study Content States */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={handleRetry} />
        ) : studyMaterial ? (
          <div className="study-dashboard-wrapper fade-in-up">
            <StudySummary
              topic={studyMaterial.topic}
              summary={studyMaterial.summary}
              flashcardCount={studyMaterial.flashcards.length}
              quizCount={studyMaterial.quiz.length}
            />

            <FlashcardSection flashcards={studyMaterial.flashcards} />

            <Quiz initialQuestions={studyMaterial.quiz} />
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

