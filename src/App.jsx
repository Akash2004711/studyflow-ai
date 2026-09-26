import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header.jsx';
import TopicInput from './components/TopicInput.jsx';
import EmptyState from './components/EmptyState.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import StudySummary from './components/StudySummary.jsx';
import FlashcardSection from './components/FlashcardSection.jsx';
import Quiz from './components/Quiz.jsx';
import AIReliabilityTest from './components/AIReliabilityTest.jsx';
import { generateStudyMaterial } from './services/api.js';
import { RefreshCw, RotateCcw } from 'lucide-react';
import './App.css';

/**
 * Main StudyFlow AI Application
 *
 * Key Architectural Decisions:
 * 1. Centralized Status State: Single `status` state ('idle' | 'loading' | 'success' | 'error')
 *    eliminates conflicting boolean states.
 * 2. Stale Request & Race Protection: An AbortController ref ensures that if a user fires a new
 *    generation request, the previous in-flight request is aborted immediately. Out-of-order network
 *    responses are discarded safely using request sequence checking.
 * 3. Preserve Previous Successful Data: If a regeneration fails, the previous successful study session
 *    remains rendered on-screen alongside a friendly error banner & retry option.
 * 4. Dev-Only Failure Simulation: Renders a Reliability Test panel in Vite DEV mode to let developers/interviewers
 *    simulate AI failure scenarios cleanly.
 */
export default function App() {
  // Centralized single status state model
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  // Study session data states
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Configuration states
  const [difficulty, setDifficulty] = useState('intermediate');
  const [flashcardCount, setFlashcardCount] = useState(5);
  const [quizCount, setQuizCount] = useState(5);

  // Last request parameters (for retry / regeneration)
  const [lastConfig, setLastConfig] = useState(null);

  // Stale request protection refs
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Clean up any ongoing fetch on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const executeGeneration = async (options) => {
    // 1. Cancel previous in-flight request if user rapidly requests a new topic
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newController = new AbortController();
    abortControllerRef.current = newController;

    // Increment request ID to trace the latest initiated request
    const currentRequestId = ++requestIdRef.current;

    setStatus('loading');
    setErrorMessage(null);

    // Save active configuration for retry and regeneration actions
    const activeConfig = {
      input: options.input,
      difficulty: options.difficulty || difficulty,
      flashcardCount: options.flashcardCount || flashcardCount,
      quizCount: options.quizCount || quizCount,
      testScenario: options.testScenario || 'normal',
    };
    setLastConfig(activeConfig);

    try {
      const data = await generateStudyMaterial(activeConfig, newController.signal);

      // Stale Response Protection: Only process result if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setStudyMaterial(data);
      setStatus('success');
    } catch (err) {
      // If the error was caused by aborting an outdated request, ignore it
      if (err.name === 'AbortError') {
        return;
      }

      // Stale Response Protection check for errors as well
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      console.error('[StudyFlow] Generation error:', err);
      setErrorMessage(err.message || 'We could not generate your study material. Please try again.');
      setStatus('error');
    }
  };

  const handleInitialGenerate = (userInput) => {
    executeGeneration({
      input: userInput,
      difficulty,
      flashcardCount,
      quizCount,
      testScenario: 'normal',
    });
  };

  const handleRunDevTestScenario = (testScenario) => {
    const topicToUse = lastConfig?.input || 'JavaScript Closures';
    executeGeneration({
      input: topicToUse,
      difficulty,
      flashcardCount,
      quizCount,
      testScenario,
    });
  };

  const handleRetry = () => {
    if (lastConfig) {
      executeGeneration(lastConfig);
    }
  };

  const handleRegenerateSession = () => {
    if (lastConfig) {
      executeGeneration({
        ...lastConfig,
        testScenario: 'normal',
      });
    }
  };

  const handleNewStudySession = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStudyMaterial(null);
    setErrorMessage(null);
    setLastConfig(null);
    setStatus('idle');
  };

  const isLoading = status === 'loading';
  const isDevMode = import.meta.env.DEV;

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Developer Failure Simulation Panel (DEV ONLY) */}
        {isDevMode && (
          <AIReliabilityTest
            onRunTest={handleRunDevTestScenario}
            isLoading={isLoading}
          />
        )}

        {/* Input & Study Configuration Panel */}
        <TopicInput
          onGenerate={handleInitialGenerate}
          isLoading={isLoading}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          flashcardCount={flashcardCount}
          onFlashcardCountChange={setFlashcardCount}
          quizCount={quizCount}
          onQuizCountChange={setQuizCount}
        />

        {/* Dynamic Study Content States */}
        {isLoading ? (
          <LoadingState />
        ) : status === 'error' && !studyMaterial ? (
          /* Error State when there is NO previous successful session */
          <ErrorState error={errorMessage} onRetry={handleRetry} />
        ) : studyMaterial ? (
          /* Render Study Material (with inline error banner if regeneration failed) */
          <>
            {status === 'error' && errorMessage && (
              <div style={{ marginBottom: '1rem' }}>
                <ErrorState error={errorMessage} onRetry={handleRetry} />
              </div>
            )}

            <StudySummary
              topic={studyMaterial.topic}
              summary={studyMaterial.summary}
              flashcardCount={studyMaterial.flashcards.length}
              quizCount={studyMaterial.quiz.length}
            />

            <FlashcardSection flashcards={studyMaterial.flashcards} />

            <Quiz initialQuestions={studyMaterial.quiz} />

            {/* Session Actions: Regenerate & New Session */}
            <div className="session-actions-bar">
              <button
                type="button"
                className="btn-primary"
                onClick={handleRegenerateSession}
                disabled={isLoading}
              >
                <RefreshCw size={16} />
                <span>Regenerate Session</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleNewStudySession}
                disabled={isLoading}
              >
                <RotateCcw size={16} />
                <span>New Study Session</span>
              </button>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
