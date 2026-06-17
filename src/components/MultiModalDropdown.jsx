import React, { useState } from 'react';
import { ChevronDown, Image as ImageIcon, Type, Mic, Volume2, Terminal } from 'lucide-react';
import './MultiModalDropdown.css';

const MultiModalDropdown = ({ currentMode, onSelectMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: 'Image to Text', icon: <ImageIcon size={16} /> },
    { label: 'Text to Image', icon: <Type size={16} /> },
    { label: 'Audio to Text', icon: <Mic size={16} /> },
    { label: 'Text to Audio', icon: <Volume2 size={16} /> }
  ];

  const displayMode = currentMode === 'Chat' ? 'AI Modes' : currentMode;

  return (
    <div className="multimodal-dropdown">
      <button 
        className="dropdown-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <span>{displayMode}</span>
        <ChevronDown size={16} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="dropdown-menu glass-panel">
          {options.map((opt, idx) => (
            <div 
              key={idx} 
              className="dropdown-item" 
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectMode(opt.label);
                setIsOpen(false);
              }}
            >
              <span className="dropdown-icon">{opt.icon}</span>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiModalDropdown;
