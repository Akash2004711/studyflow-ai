import React from 'react';
import { Layers, HelpCircle, BookOpen } from 'lucide-react';

/**
 * StudySummary Component
 * Displays the verified topic name, high-level summary, and item counts.
 */
export default function StudySummary({ topic, summary, flashcardCount, quizCount }) {
  return (
    <div className="summary-card">
      <div className="summary-header">
        <div className="summary-topic-badge">
          <BookOpen size={14} />
          <span>Study Summary</span>
        </div>
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
