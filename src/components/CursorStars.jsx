import { useEffect } from 'react';
import './CursorStars.css';

const CursorStars = () => {
  useEffect(() => {
    let lastTime = 0;

    const handleMouseMove = (e) => {
      const currentTime = Date.now();
      // Throttle particle creation to ~1 per 30ms for performance
      if (currentTime - lastTime < 30) return;
      lastTime = currentTime;

      const star = document.createElement('div');
      star.className = 'cursor-star';
      
      // Randomize star size (2px to 5px)
      const size = Math.random() * 3 + 2; 
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Origin at cursor center
      star.style.left = `${e.clientX - size/2}px`;
      star.style.top = `${e.clientY - size/2}px`;
      
      // Randomize float direction (-1 to 1) for X and Y
      star.style.setProperty('--dir-x', Math.random() * 2 - 1);
      // Give Y a slightly upward float bias
      star.style.setProperty('--dir-y', Math.random() * -1.5 - 0.5);
      
      document.body.appendChild(star);
      
      // Clean up the DOM node after the CSS animation finishes (1000ms)
      setTimeout(() => {
        star.remove();
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return null;
};

export default CursorStars;
