import React from 'react';
import './ModelGrid.css';

const ModelGrid = ({ results, matches, selectedModel, onSelectModel, isProcessing }) => {
  // results is expected to be an object: { gpt: '', claude: '', grok: '', gemini: '' }
  // Since we are using Ollama, we'll map these to 'llama3', 'mistral', 'gemma', 'phi3'
  // But visually we can still label them as the 4 premium models or generic names.

  const models = [
    { id: 'model1', name: 'Meta Llama 3', color: '#1877F2' },
    { id: 'model2', name: 'Moondream', color: '#00D1FF' },
    { id: 'model3', name: 'DeepSeek', color: '#4D61FF' },
    { id: 'model4', name: 'Qwen', color: '#7E52FF' }
  ];

  return (
    <div className="model-grid-container">
      {models.map(model => (
        <div key={model.id} className={`model-card glass-panel ${selectedModel === model.id ? 'selected' : ''}`}>
          <div className="model-header">
            <div className="model-indicator" style={{ backgroundColor: model.color }}></div>
            <h3 className="model-name">{model.name}</h3>
          </div>
          <div className="model-content">
            {results[model.id] ? (
              <p>{results[model.id]}</p>
            ) : isProcessing ? (
              <div className="model-loading">
                <div className="mini-spinner" style={{ borderColor: 'rgba(57, 255, 20, 0.2)', borderTopColor: model.color }}></div>
                <span className="text-neon" style={{ color: model.color }}>Generating Response...</span>
              </div>
            ) : (
              <div className="placeholder-text">Awaiting your query below...</div>
            )}
          </div>
          {results[model.id] && matches && matches[model.id] > 0 && (
            <div className="model-footer">
              <div className="solution-match-info">
                <span className="match-label">Solution Match</span>
                <span className="match-value">{matches[model.id]}%</span>
              </div>
              <button 
                className={`select-btn ${selectedModel === model.id ? 'active' : ''}`}
                onClick={() => onSelectModel(model.id)}
                style={{ '--dynamic-color': model.color }}
              >
                {selectedModel === model.id ? '★ Selected' : 'Select as Best'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModelGrid;
