import React from 'react';
import PropTypes from 'prop-types';

export default function LoadingSpinner({ 
  size = 'medium', 
  fullPage = false,
  backdrop = true,
  className = ''
}) {
  const sizeMap = {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-3',
    large: 'w-8 h-8 border-4'
  };

  const spinner = (
    <div 
      className={`rounded-full animate-spin border-blue-500 border-t-transparent ${
        sizeMap[size] || sizeMap.medium
      } ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${
        backdrop ? 'bg-white bg-opacity-90' : ''
      }`}>
        {spinner}
      </div>
    );
  }

  return spinner;
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullPage: PropTypes.bool,
  backdrop: PropTypes.bool,
  className: PropTypes.string
};