import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading spinner component with agricultural theme
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (small, medium, large)
 * @param {string} props.color - Spinner color (primary, secondary, white)
 * @param {string} props.text - Optional loading text
 * @returns {React.ReactElement} LoadingSpinner component
 */
const LoadingSpinner = ({ size = 'medium', color = 'primary', text = '' }) => {
  const spinnerClasses = [
    'spinner',
    `spinner-${size}`,
    `spinner-${color}`
  ].join(' ');

  return (
    <div className="spinner-container">
      <div className={spinnerClasses}>
        <div className="spinner-leaf"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;