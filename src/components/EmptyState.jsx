import React from 'react';
import { Layers, HelpCircle, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import FloatingCard from './FloatingCard.jsx';

export default function EmptyState() {
  return (
    <div className="hero-landing-wrapper">
      <div className="floating-elements-container" aria-hidden="true">
        <FloatingCard
          icon={Layers}
          title="What is a closure?"
          badge="FLASHCARD"
          previewText="Click card to flip 3D..."
          positionClass="pos-top-left"
          delay={0}
        />
        <FloatingCard
          icon={HelpCircle}
          title="Multiple Choice Quiz"
          badge="QUIZ"
          previewText="A  B  C  D options"
          positionClass="pos-bottom-left"
          delay={1.2}
        />
        <FloatingCard
          icon={FileText}
          title="Key Concept Summary"
          badge="AI NOTES"
          previewText="✦ Instant overview ✦"
          positionClass="pos-top-right"
          delay={0.6}
        />
      </div>

      <div className="hero-landing-content">
        <div className="hero-spark-pill">
          <Sparkles size={14} className="hero-spark-icon" />
          <span>Next-Gen AI Learning Engine</span>
        </div>

        <h2 className="hero-main-title">
          Turn your knowledge into an <span className="hero-text-gradient">interactive study session.</span>
        </h2>

        <p className="hero-subtitle">
          Paste your lecture notes, complex concepts, or topic prompt below to generate instant flip flashcards, smart quiz questions, and concise summaries.
        </p>

        <div className="hero-features-row">
          <div className="hero-feature-item">
            <CheckCircle2 size={16} className="hero-feature-check" />
            <span>AI-Powered Learning</span>
          </div>
          <div className="hero-feature-item">
            <CheckCircle2 size={16} className="hero-feature-check" />
            <span>Interactive Flashcards</span>
          </div>
          <div className="hero-feature-item">
            <CheckCircle2 size={16} className="hero-feature-check" />
            <span>Smart MCQ Practice</span>
          </div>
        </div>
      </div>
    </div>
  );
}

