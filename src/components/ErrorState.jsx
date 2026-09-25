import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorState Component
 * Displays user-friendly error details and a retry button when generation or network fails.
 */
export default function ErrorState({ error, onRetry }) {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message || "We couldn't generate your study material. Please try again.";

  return (
    <div className="state-container error-state" role="alert">
      <div className="state-icon-box error" aria-hidden="true">
        <AlertTriangle size={32} />
      </div>
      <h3 className="state-title">Something went wrong</h3>
      <p className="state-description">{errorMessage}</p>

      {onRetry && (
        <button type="button" className="btn-primary" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
