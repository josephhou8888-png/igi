
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full absolute border-4 border-gray-700"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-brand-primary border-t-transparent"></div>
      </div>
      <p className="text-gray-400 text-sm font-medium animate-pulse">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
