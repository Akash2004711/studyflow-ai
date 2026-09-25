/**
 * Custom application error class for structured API error handling.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error codes used across the StudyFlow AI backend.
 */
export const ErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_RESPONSE_MALFORMED: 'AI_RESPONSE_MALFORMED',
  AI_RESPONSE_INVALID: 'AI_RESPONSE_INVALID',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

/**
 * Creates a standardized error response object.
 */
export const formatErrorResponse = (error) => {
  const code = error.code || ErrorCodes.INTERNAL_ERROR;
  const message = error.message || 'An unexpected error occurred.';
  const details = error.details || undefined;

  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
};
