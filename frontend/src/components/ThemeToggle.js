import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

function ThemeToggle({ showLabel = false }) {
  const { themeName, toggleTheme, setTheme } = useTheme();
  
  const themes = [
    { name: 'light', icon: FiSun, label: 'Light' },
    { name: 'dark', icon: FiMoon, label: 'Dark' },
    { name: 'system', icon: FiMonitor, label: 'System' }
  ];

  const currentIcon = themes.find(t => t.name === themeName)?.icon || FiSun;
  const currentLabel = themes.find(t => t.name === themeName)?.label || 'Light';

  return (
    <div className="theme-toggle-container">
      <motion.button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title={`Current: ${currentLabel} mode`}
        aria-label={`Switch theme. Current: ${currentLabel}`}
      >
        <motion.div
          className="theme-icon-wrapper"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {React.createElement(currentIcon, { size: 18 })}
        </motion.div>
        {showLabel && <span className="theme-label">{currentLabel}</span>}
      </motion.button>
      
      <div className="theme-dropdown" role="listbox" aria-label="Select theme">
        {themes.map((t) => (
          <motion.button
            key={t.name}
            className={`theme-option ${themeName === t.name ? 'active' : ''}`}
            onClick={() => setTheme(t.name)}
            role="option"
            aria-selected={themeName === t.name}
            whileHover={{ x: 4 }}
          >
            <motion.div
              className="option-icon"
              animate={{ 
                scale: themeName === t.name ? 1.1 : 1,
                rotate: themeName === t.name ? [0, -5, 5, 0] : 0
              }}
              transition={{ duration: 0.3 }}
            >
              {React.createElement(t.icon, { size: 16 })}
            </motion.div>
            <span>{t.label}</span>
            {themeName === t.name && (
              <motion.div
                className="active-indicator"
                layoutId="activeTheme"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default ThemeToggle;
