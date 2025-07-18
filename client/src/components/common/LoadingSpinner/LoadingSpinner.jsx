import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', className = '' }) => {
  const spinnerClasses = [
    'loading-spinner',
    `spinner-${size}`,
    `spinner-${color}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={spinnerClasses}>
      <div className="spinner-circle"></div>
    </div>
  );
};

export default LoadingSpinner;