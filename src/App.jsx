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
 *
 * Key Architectural Decisions:
 * 1. Stale Request Prevention: An AbortController ref ensures that if a user fires a second
 *    generation request before the first finishes, the first request is aborted immediately
 *    so out-of-order network responses never overwrite the user's latest requested study topic.
 * 2. Security: API calls target our Express backend proxy rather than invoking the LLM directly
 *    from the client, protecting the Gemini API secret from browser exposure.
 * 3. Structured Data Validation: All AI responses are treated as untrusted and validated
 *    against a strict schema before being rendered.
 */
export default function App() {
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastInput, setLastInput] = useState('');

  // Ref to hold the active AbortController for race-condition / stale-response prevention
  const abortControllerRef = useRef(null);

  // Clean up any ongoing fetch on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleGenerate = async (userInput) => {
    if (!userInput || !userInput.trim()) return;

    // 1. Cancel previous in-flight request if user rapidly requests a new topic
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
      // If the error was caused by aborting an outdated request, ignore it
      if (err.name === 'AbortError') {
        return;
      }
      console.error('[StudyFlow] Generation failed:', err);
      setError(err.message || 'We could not generate your study material. Please try again.');
    } finally {
      // Only reset loading state if this controller is still the active one
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

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Input Area */}
        <TopicInput onGenerate={handleGenerate} isLoading={isLoading} />

        {/* Dynamic Study Content States */}
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={handleRetry} />
        ) : studyMaterial ? (
          <>
            <StudySummary
              topic={studyMaterial.topic}
              summary={studyMaterial.summary}
              flashcardCount={studyMaterial.flashcards.length}
              quizCount={studyMaterial.quiz.length}
            />

            <FlashcardSection flashcards={studyMaterial.flashcards} />

            <Quiz initialQuestions={studyMaterial.quiz} />
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
