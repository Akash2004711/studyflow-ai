import React, { useState } from 'react';
import { Layers, HelpCircle, BookOpen, Copy, Check } from 'lucide-react';

/**
 * StudySummary Component
 * Displays the verified topic name, high-level summary, item counts, and a copy summary button.
 */
export default function StudySummary({ topic, summary, flashcardCount, quizCount }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopySummary = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary to clipboard:', err);
    }
  };

  return (
    <div className="summary-card">
      <div className="summary-header">
        <div className="summary-topic-badge">
          <BookOpen size={14} />
          <span>Study Summary</span>
        </div>

        <button
          type="button"
          className="btn-secondary copy-summary-btn"
          onClick={handleCopySummary}
          aria-label="Copy summary text to clipboard"
        >
          {isCopied ? (
            <>
              <Check size={14} color="var(--success)" />
              <span style={{ color: 'var(--success)' }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Summary</span>
            </>
          )}
        </button>
      </div>

      <h2 className="summary-title">{topic}</h2>
      <p className="summary-body">{summary}</p>

      <div className="summary-stats-row">
        <div className="summary-stat-item">
          <Layers size={16} color="var(--primary)" />
          <span>
            Flashcards: <strong className="summary-stat-value">{flashcardCount}</strong>
          </span>
        </div>
        <div className="summary-stat-item">
          <HelpCircle size={16} color="var(--accent-cyan)" />
          <span>
            Quiz Questions: <strong className="summary-stat-value">{quizCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
