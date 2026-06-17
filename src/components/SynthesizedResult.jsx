import React from 'react';
import './SynthesizedResult.css';

const SynthesizedResult = ({ result, isProcessing }) => {
  if (!result && !isProcessing) return null;

  return (
    <div className={`synthesized-container glass-panel ${isProcessing ? 'synth-loading' : ''}`}>
      <div className="synth-header">
        <h2 className="synth-title text-gradient">
          {isProcessing ? 'ANALYZING & OPTIMIZING...' : 'OPTIMIZED RESULT'}
        </h2>
      </div>
      <div className="synth-content">
        <p className={isProcessing ? 'text-muted' : ''}>{result}</p>
        {isProcessing && <div className="synth-spinner"></div>}
      </div>
    </div>
  );
};

export default SynthesizedResult;
