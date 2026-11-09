import React from 'react';

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

const LoadingSpinner = ({ size = 'md', message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-blue-500 border-t-transparent`}
      />
      {message && (
        <p className="mt-3 text-sm text-slate-500">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
