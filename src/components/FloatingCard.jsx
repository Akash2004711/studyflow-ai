import React, { useState, useEffect } from 'react';
import { Layers, HelpCircle, FileText, Sparkles } from 'lucide-react';

/**
 * FloatingCard Component
 * Interactive decorative card with mouse-aware subtle 3D tilt, float animation, and glassmorphism styling.
 */
export default function FloatingCard({ icon: Icon, title, badge, previewText, positionClass, delay = 0 }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Check prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const rotateX = ((clientY - centerY) / centerY) * -6;
      const rotateY = ((clientX - centerX) / centerX) * 6;

      setTilt({ x: rotateX.toFixed(2), y: rotateY.toFixed(2) });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`floating-3d-card ${positionClass}`}
      style={{
        animationDelay: `${delay}s`,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(10px)`,
      }}
      aria-hidden="true"
    >
      <div className="floating-card-inner">
        <div className="floating-card-header">
          <span className="floating-card-badge">{badge}</span>
          <Icon size={16} className="floating-card-icon" />
        </div>
        <div className="floating-card-title">{title}</div>
        <div className="floating-card-preview">{previewText}</div>
      </div>
    </div>
  );
}
