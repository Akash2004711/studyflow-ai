import { validateStudyResponse } from '../utils/validateResponse';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Sends a study generation request to the backend API.
 * Accepts an AbortSignal to cancel stale requests if the user fires a new request.
 *
 * @param {string} input - The topic name or study notes from the user.
 * @param {AbortSignal} [signal] - Optional AbortSignal for race-condition cancellation.
 * @returns {Promise<{ topic: string, summary: string, flashcards: Array, quiz: Array }>}
 */
export async function generateStudyMaterial(input, signal) {
  if (!input || !input.trim()) {
    throw new Error('Please provide a study topic or notes before generating.');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/study/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: input.trim() }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      // Re-throw AbortError so caller can ignore superseded requests cleanly
      throw err;
    }
    throw new Error(
      'Unable to connect to the StudyFlow server. Please ensure the backend is running and try again.'
    );
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    throw new Error('Failed to parse server response. Please try again.');
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
    throw new Error(
      validation.error || 'Something went wrong while processing the AI response.'
    );
  }

  return validation.validatedData;
}
