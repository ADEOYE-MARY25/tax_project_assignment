import React from 'react';

function LoadingAnimation({ loadingTime, isDarkMode }) {
  const secondaryBgClass = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <div className={`${secondaryBgClass} p-4 rounded-lg`}>
          {/* Three Circles Fading Animation */}
          <div className="flex gap-2 items-center mb-2">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
          {/* Loading Timer */}
          <div className="text-sm opacity-50">
            Generating response... {loadingTime.toFixed(1)}s
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingAnimation;

