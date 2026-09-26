import React, { useState, useEffect, useRef } from 'react';
import { Layers, HelpCircle, BookOpen, Copy, Check } from 'lucide-react';

/**
 * StudySummary Component
 * Displays verified topic name, summary body, item counts, 3D hover depth, and a Copy Summary action with checkmark feedback.
 */
export default function StudySummary({ topic, summary, flashcardCount, quizCount }) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      setTilt({ x: rotateX.toFixed(2), y: rotateY.toFixed(2) });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(`${topic}\n\n${summary}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  return (
    <div
      ref={cardRef}
      className="summary-card 3d-tilt-card"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      <div className="summary-header">
        <div className="summary-topic-badge">
          <BookOpen size={14} />
          <span>✦ STUDY SUMMARY</span>
        </div>

        <button
          type="button"
          className="btn-copy-summary"
          onClick={handleCopySummary}
          aria-label="Copy study summary to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} className="copy-check-icon" />
              <span>✓ Copied</span>
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
          <Layers size={16} className="stat-icon-primary" />
          <span>
            Flashcards: <strong className="summary-stat-value">{flashcardCount}</strong>
          </span>
        </div>
        <div className="summary-stat-item">
          <HelpCircle size={16} className="stat-icon-cyan" />
          <span>
            Quiz Questions: <strong className="summary-stat-value">{quizCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

