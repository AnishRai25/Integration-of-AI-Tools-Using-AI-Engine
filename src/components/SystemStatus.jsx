import React from 'react';
import './SystemStatus.css';

const SystemStatus = () => {
  return (
    <div className="system-status-container" title="4 Elite Models Connected">
      <div className="status-indicator">
        <span className="pulse-dot"></span>
        <span className="status-text">SYSTEM: ONLINE</span>
      </div>
      
      <div className="divider"></div>
      
      <div className="model-equalizers">
        <div className="bar bar-1"></div>
        <div className="bar bar-2"></div>
        <div className="bar bar-3"></div>
        <div className="bar bar-4"></div>
      </div>
    </div>
  );
};

export default SystemStatus;
