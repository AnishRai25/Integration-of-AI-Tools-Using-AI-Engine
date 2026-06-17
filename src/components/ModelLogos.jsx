import React from 'react';
import { BrainCircuit, Wind, Radar, Zap } from 'lucide-react';
import './ModelLogos.css';

const ModelLogos = ({ currentMode, onSelectMode }) => {
  const logos = [
    { name: 'Llama 3', color: '#1877F2', icon: <BrainCircuit size={20} /> },
    { name: 'Mistral', color: '#F26101', icon: <Wind size={20} /> },
    { name: 'DeepSeek', color: '#4D61FF', icon: <Radar size={20} /> },
    { name: 'Qwen', color: '#7E52FF', icon: <Zap size={20} /> }
  ];

  return (
    <div className="model-logos-container">
      {logos.map((logo, idx) => (
        <div 
          key={idx} 
          className={`model-logo-wrapper ${currentMode === logo.name ? 'active-logo' : ''}`}
          title={`Switch to Interface: ${logo.name}`}
          onClick={() => onSelectMode(logo.name)}
          style={{ '--logo-color': logo.color, cursor: 'pointer' }}
        >
          {logo.icon}
        </div>
      ))}
    </div>
  );
};

export default ModelLogos;
