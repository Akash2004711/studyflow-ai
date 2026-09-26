import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, RotateCw, Sparkles, HelpCircle } from 'lucide-react';

/**
 * Flashcard Component
 * Renders an authentic 3D flip card utilizing CSS perspective, transform-style: preserve-3d,
 * backface-visibility: hidden, and interactive rotateY(180deg) animations.
 */
export default function Flashcard({ card, isAnswerRevealed, onToggleAnswer }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Subtle mouse tilt effect limited to 6deg
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      setTilt({ x: rotateX.toFixed(2), y: rotateY.toFixed(2) });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!card) return null;

  return (
    <div
      ref={cardRef}
      className="flashcard-3d-scene"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      onClick={onToggleAnswer}
      role="button"
      tabIndex={0}
      aria-label={`Flashcard: ${card.question}. Click to flip.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleAnswer();
        }
      }}
    >
      <div className={`flashcard-3d-inner ${isAnswerRevealed ? 'is-flipped' : ''}`}>
        {/* CARD FRONT */}
        <div className="flashcard-3d-face flashcard-front">
          <div className="flashcard-face-header">
            <span className="flashcard-type-badge">
              <HelpCircle size={13} />
              <span>QUESTION</span>
            </span>
            <span className="flip-hint">
              <RotateCw size={13} /> Click to flip
            </span>
          </div>

          <div className="flashcard-body-content">
            <p className="flashcard-prompt-text">{card.question}</p>
          </div>

          <div className="flashcard-face-footer">
            <button
              type="button"
              className="btn-flip-trigger"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAnswer();
              }}
            >
              <Eye size={15} />
              <span>Reveal Answer</span>
            </button>
          </div>
        </div>

        {/* CARD BACK */}
        <div className="flashcard-3d-face flashcard-back">
          <div className="flashcard-face-header">
            <span className="flashcard-type-badge answer-badge">
              <Sparkles size={13} />
              <span>ANSWER & EXPLANATION</span>
            </span>
            <span className="flip-hint">
              <RotateCw size={13} /> Click to flip
            </span>
          </div>

          <div className="flashcard-body-content">
            <div className="flashcard-answer-section">
              <h4 className="flashcard-section-label">ANSWER</h4>
              <p className="flashcard-answer-main">{card.answer}</p>
            </div>

            {card.explanation && card.explanation !== card.answer && (
              <div className="flashcard-why-section">
                <h4 className="flashcard-section-label why-label">WHY?</h4>
                <p className="flashcard-explanation-text">{card.explanation}</p>
              </div>
            )}
          </div>

          <div className="flashcard-face-footer">
            <button
              type="button"
              className="btn-flip-trigger"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAnswer();
              }}
            >
              <EyeOff size={15} />
              <span>Hide Answer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

