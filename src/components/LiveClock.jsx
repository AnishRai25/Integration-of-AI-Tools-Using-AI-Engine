import React, { useState, useEffect } from 'react';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="live-clock" style={{ 
        marginRight: '16px', 
        fontSize: '0.9rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end', 
        letterSpacing: '1px',
        color: 'var(--neon-green)',
        textShadow: '0 0 5px rgba(57, 255, 20, 0.5)'
    }}>
      <span style={{ fontWeight: 600 }}>{formattedTime}</span>
      <span style={{ fontSize: '0.75rem', opacity: 0.8, color: 'var(--text-secondary)' }}>{formattedDate}</span>
    </div>
  );
};

export default LiveClock;
