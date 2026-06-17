import React from 'react';
import { Search } from 'lucide-react';
import './QuickCommand.css';

const QuickCommand = () => {
  return (
    <div className="quick-command-bar" title="Quick Actions Palette">
      <Search size={14} className="qc-icon" />
      <span className="qc-text">Search models, chats, or commands...</span>
      <div className="qc-shortcut">
        <span>Ctrl</span>
        <span>+</span>
        <span>K</span>
      </div>
    </div>
  );
};

export default QuickCommand;
