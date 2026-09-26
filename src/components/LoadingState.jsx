import React from 'react';
import { Sparkles, Brain, Layers, CheckCircle2 } from 'lucide-react';

/**
 * LoadingState Component
 * Premium AI generation loading animation with pulsing icons and progress visuals.
 */
export default function LoadingState() {
  return (
    <div className="state-container loading-3d-container" aria-live="assertive" aria-busy="true">
      <div className="ai-loading-orb-wrapper">
        <div className="ai-loading-orb">
          <Sparkles size={32} className="ai-loading-sparkle" />
        </div>
        <div className="ai-loading-pulse-ring" />
        <div className="ai-loading-pulse-ring delay-1" />
      </div>

      <h3 className="state-title loading-title-shimmer">Creating your study session</h3>
      <p className="state-description">
        Analyzing your notes, drafting concise 3D flashcards, and building interactive quiz questions...
      </p>

      <div className="loading-steps-box">
        <div className="loading-step-item active">
          <Brain size={16} className="step-icon-active" />
          <span>Structuring key conceptual insights</span>
        </div>
        <div className="loading-step-item active">
          <Layers size={16} className="step-icon-active" />
          <span>Preparing 3D flashcards & quiz practice</span>
        </div>
        <div className="loading-step-item">
          <CheckCircle2 size={16} className="step-icon-muted" />
          <span>Validating structured schema integrity</span>
        </div>
      </div>
    </div>
  );
}

