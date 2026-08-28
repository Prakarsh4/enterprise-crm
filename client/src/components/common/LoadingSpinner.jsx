// client/src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`${sizeMap[size]} border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;