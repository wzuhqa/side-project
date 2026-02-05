import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium', showTagline = true }) => {
  const getDimensions = () => {
    switch(size) {
      case 'small': return { width: 40, height: 40 };
      case 'large': return { width: 80, height: 80 };
      default: return { width: 56, height: 56 };
    }
  };

  const { width, height } = getDimensions();

  return (
    <div className={`logo logo-${size}`}>
      <svg 
        viewBox="0 0 100 100" 
        width={width} 
        height={height}
        className="logo-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Animated background circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="url(#logoGradient)"
          filter="url(#logoShadow)"
          className="logo-circle"
        />
        
        {/* Shopping bag icon */}
        <g className="logo-icon">
          {/* Bag body */}
          <path 
            d="M30 35 L30 75 Q30 80 35 80 L65 80 Q70 80 70 75 L70 35" 
            fill="none" 
            stroke="white" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          
          {/* Bag handles */}
          <path 
            d="M40 35 Q40 25 50 25 Q60 25 60 35" 
            fill="none" 
            stroke="white" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          
          {/* Star/sparkle */}
          <polygon 
            points="50,45 52,50 57,50 53,53 55,58 50,55 45,58 47,53 43,50 48,50"
            fill="white"
            className="logo-star"
          />
          
          {/* Decorative dots */}
          <circle cx="35" cy="65" r="3" fill="white" className="logo-dot" style={{ animationDelay: '0s' }} />
          <circle cx="65" cy="65" r="3" fill="white" className="logo-dot" style={{ animationDelay: '0.2s' }} />
          <circle cx="40" cy="72" r="2" fill="white" className="logo-dot" style={{ animationDelay: '0.4s' }} />
          <circle cx="60" cy="72" r="2" fill="white" className="logo-dot" style={{ animationDelay: '0.6s' }} />
        </g>
      </svg>
      
      <div className="logo-text">
        <span className="logo-title">ShopNova</span>
        {showTagline && <span className="logo-tagline">Premium Shopping</span>}
      </div>
    </div>
  );
};

export default Logo;
