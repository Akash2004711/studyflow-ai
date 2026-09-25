import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

/**
 * Header Component
 * Displays application branding, logo, and active AI indicator.
 */
export default function Header() {
  return (
    <header className="header-wrapper">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-icon-box" aria-hidden="true">
            <BookOpen size={22} />
          </div>
          <div className="brand-text-box">
            <h1>StudyFlow AI</h1>
            <p>Interactive AI Study Assistant</p>
          </div>
        </div>

        <div className="header-badge" title="Powered by Gemini Structured JSON Generation">
          <span className="badge-dot" aria-hidden="true" />
          <Sparkles size={14} />
          <span>AI Powered</span>
        </div>
      </div>
    </header>
  );
}
