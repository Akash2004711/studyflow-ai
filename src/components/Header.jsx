import React from 'react';
import { Sparkles, Plus, Layers } from 'lucide-react';

/**
 * Header Component
 * Minimal premium header featuring custom visual 3D logo mark, AI indicator, and + New Study reset action.
 */
export default function Header({ onNewStudy, hasActiveSession }) {
  return (
    <header className="header-wrapper">
      <div className="header-container">
        <div className="brand-group" onClick={onNewStudy} role="button" tabIndex={0} title="Return to home">
          <div className="brand-icon-box" aria-hidden="true">
            <span className="brand-spark-icon">✦</span>
          </div>
          <div className="brand-text-box">
            <h1>StudyFlow AI</h1>
            <p>Interactive 3D Study Assistant</p>
          </div>
        </div>

        <div className="header-actions">
          {hasActiveSession && (
            <button
              type="button"
              className="btn-header-new-study"
              onClick={onNewStudy}
              aria-label="Start a new study session"
            >
              <Plus size={16} />
              <span>New Study</span>
            </button>
          )}

          <div className="header-badge" title="Powered by Gemini Structured JSON Generation">
            <span className="badge-dot" aria-hidden="true" />
            <Sparkles size={14} />
            <span className="badge-text">AI Powered</span>
          </div>
        </div>
      </div>
    </header>
  );
}

