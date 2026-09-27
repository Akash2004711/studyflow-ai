import React from 'react';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';

/**
 * ErrorState Component
 * Displays user-friendly error details and retry options when generation or network fails.
 */
export default function ErrorState({ error, onRetry }) {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message || "We couldn't generate your study material. Please try again.";

  const isRateLimit = errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('wait a moment');

  return (
    <div className="state-container error-state" role="alert">
      <div className={`state-icon-box ${isRateLimit ? 'warning' : 'error'}`} aria-hidden="true">
        {isRateLimit ? <Clock size={32} /> : <AlertTriangle size={32} />}
      </div>
      <h3 className="state-title">{isRateLimit ? 'AI Rate Limit Reached' : 'Something went wrong'}</h3>
      <p className="state-description">{errorMessage}</p>

      {onRetry && (
        <button type="button" className="btn-primary" onClick={onRetry} style={{ marginTop: '0.75rem' }}>
          <RefreshCw size={16} />
          <span>Try Again Now</span>
        </button>
      )}
    </div>
  );
}

