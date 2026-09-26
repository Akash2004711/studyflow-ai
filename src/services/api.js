import { validateStudyResponse } from '../utils/validateResponse';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Sends a study generation request to the backend API.
 * Accepts options including input, difficulty, flashcardCount, quizCount, testScenario,
 * and an AbortSignal to cancel stale requests if the user fires a new request.
 *
 * @param {Object} options
 * @param {string} options.input - The topic name or study notes from the user.
 * @param {string} [options.difficulty='intermediate'] - Difficulty level.
 * @param {number} [options.flashcardCount=5] - Flashcard count.
 * @param {number} [options.quizCount=5] - Quiz question count.
 * @param {string} [options.testScenario='normal'] - Developer test mode scenario.
 * @param {AbortSignal} [signal] - Optional AbortSignal for race-condition cancellation.
 * @returns {Promise<{ topic: string, summary: string, flashcards: Array, quiz: Array }>}
 */
export async function generateStudyMaterial(options, signal) {
  const {
    input,
    difficulty = 'intermediate',
    flashcardCount = 5,
    quizCount = 5,
    testScenario = 'normal',
  } = options || {};

  if (!input || !input.trim()) {
    throw new Error('Please provide a study topic or notes before generating.');
  }

  // Create an internal AbortController to support timeouts, chained with external signal
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort(new Error('TIMEOUT_ERROR'));
  }, REQUEST_TIMEOUT_MS);

  // Combine external cancellation signal with internal timeout signal
  const onExternalAbort = () => timeoutController.abort(signal.reason);
  if (signal) {
    if (signal.aborted) {
      timeoutController.abort(signal.reason);
    } else {
      signal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/study/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: input.trim(),
        difficulty,
        flashcardCount,
        quizCount,
        testScenario,
      }),
      signal: timeoutController.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onExternalAbort);
    }

    // Distinguish timeout abort from user cancellation abort
    if (err.name === 'AbortError' || timeoutController.signal.aborted) {
      if (timeoutController.signal.reason?.message === 'TIMEOUT_ERROR' || err.message === 'TIMEOUT_ERROR') {
        const timeoutErr = new Error('The request is taking too long. Please try again.');
        timeoutErr.code = 'TIMEOUT_ERROR';
        throw timeoutErr;
      }
      // Re-throw normal user AbortError so caller can ignore superseded requests cleanly
      throw err;
    }
    const networkErr = new Error(
      'Unable to connect to the server. Please check your connection and try again.'
    );
    networkErr.code = 'NETWORK_ERROR';
    throw networkErr;
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onExternalAbort);
    }
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    const parseErr = new Error('We received an invalid response from the AI. Please try again.');
    parseErr.code = 'INVALID_RESPONSE';
    throw parseErr;
  }

  if (!response.ok || !responseData.success) {
    const errorMsg =
      responseData?.error?.message ||
      `Server returned error status (${response.status}). Please try again.`;
    const err = new Error(errorMsg);
    err.code = responseData?.error?.code || 'SERVER_ERROR';
    throw err;
  }

  // Client-side defense-in-depth validation
  const validation = validateStudyResponse(responseData.data);
  if (!validation.isValid) {
    const schemaErr = new Error(
      'The AI returned data in an unexpected format. Please try again.'
    );
    schemaErr.code = 'SCHEMA_ERROR';
    throw schemaErr;
  }

  return validation.validatedData;
}
