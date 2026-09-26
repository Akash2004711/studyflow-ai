import React, { useState } from 'react';
import { ShieldAlert, Play } from 'lucide-react';

const SCENARIOS = [
  { value: 'normal', label: 'Normal AI Response' },
  { value: 'malformed-json', label: 'Malformed JSON' },
  { value: 'invalid-schema', label: 'Invalid Schema' },
  { value: 'empty', label: 'Empty Response' },
  { value: 'slow', label: 'Slow Response' },
  { value: 'server-error', label: 'Server Error' },
];

/**
 * AIReliabilityTest Component
 * Development-only panel that allows developers and interviewers to simulate various
 * AI failure modes to verify error boundaries, user notifications, and retries.
 */
export default function AIReliabilityTest({ onRunTest, isLoading }) {
  const [selectedScenario, setSelectedScenario] = useState('malformed-json');

  const handleTestClick = () => {
    onRunTest(selectedScenario);
  };

  return (
    <div className="dev-test-panel" role="region" aria-label="Developer AI Reliability Test Mode">
      <div className="dev-test-header">
        <div className="dev-test-title">
          <ShieldAlert size={16} color="var(--warning)" />
          <span>Developer AI Reliability Test Mode</span>
        </div>
        <span className="dev-test-badge">DEV ONLY</span>
      </div>

      <p className="dev-test-description">
        Simulate AI failures to test loading states, schema validation, request timeouts, and error handling.
      </p>

      <div className="dev-test-controls">
        <select
          className="dev-test-select"
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          disabled={isLoading}
          aria-label="Select AI failure simulation scenario"
        >
          {SCENARIOS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn-secondary dev-test-btn"
          onClick={handleTestClick}
          disabled={isLoading}
        >
          <Play size={14} />
          <span>Test Scenario</span>
        </button>
      </div>
    </div>
  );
}
