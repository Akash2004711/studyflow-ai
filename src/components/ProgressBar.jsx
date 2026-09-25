import React from 'react';

/**
 * ProgressBar Component
 * Accessible, animated horizontal progress indicator.
 */
export default function ProgressBar({ current, total, label = 'Progress' }) {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div
      className="progress-bar-container"
      role="progressbar"
      aria-label={label}
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}
