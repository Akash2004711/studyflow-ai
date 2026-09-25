import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * EmptyState Component
 * Displays helpful onboarding guidance before the user has generated study materials.
 */
export default function EmptyState() {
  return (
    <div className="state-container" aria-live="polite">
      <div className="state-icon-box" aria-hidden="true">
        <BookOpen size={32} />
      </div>
      <h3 className="state-title">Your study material will appear here</h3>
      <p className="state-description">
        Enter a topic or paste your study notes above to generate interactive flashcards, concise summaries, and self-assessment quizzes.
      </p>
    </div>
  );
}
