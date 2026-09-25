import React from 'react';
import { Sparkles, Brain, CheckCircle2 } from 'lucide-react';

/**
 * LoadingState Component
 * Displays animated progress while LLM generation and structured validation are in progress.
 */
export default function LoadingState() {
  return (
    <div className="state-container" aria-live="assertive" aria-busy="true">
      <div className="spinner-pulse" aria-hidden="true" />
      <h3 className="state-title">Generating your study material...</h3>
      <p className="state-description">
        Analyzing your topic, drafting concise flashcards, and building an interactive quiz.
      </p>

      <div className="loading-steps">
        <div className="loading-step-item active">
          <Brain size={16} color="var(--primary)" />
          <span>Structuring key conceptual insights</span>
        </div>
        <div className="loading-step-item active">
          <Sparkles size={16} color="var(--accent-cyan)" />
          <span>Generating 5 flashcards & 5 quiz questions</span>
        </div>
        <div className="loading-step-item">
          <CheckCircle2 size={16} color="var(--text-muted)" />
          <span>Validating structured schema integrity</span>
        </div>
      </div>
    </div>
  );
}
