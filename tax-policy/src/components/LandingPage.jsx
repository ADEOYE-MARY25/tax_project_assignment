import React from 'react';
import { Send } from 'lucide-react';

function LandingPage({ user, isAuthenticated, inputMessage, onInputChange, onSend, isDarkMode }) {
  const secondaryBgClass = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  const inputBgClass = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';

  return (
    <div className="mt-20 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          Hello There😊!
        </h2>
        <p className="text-xl opacity-70">
          What do you want to know about the new Nigeria tax policy?
        </p>
      </div>
      

<div
  className={`
    ${secondaryBgClass}
    rounded-lg
    p-3
    sm:p-4
    flex
    flex-col
    sm:flex-row
    gap-3
    max-w-3xl
    mx-auto
  `}
>
  <input
    type="text"
    value={inputMessage}
    onChange={(e) => onInputChange(e.target.value)}
    onKeyPress={(e) => e.key === "Enter" && onSend()}
    className={`
      w-full
      flex-1
      p-3
      rounded-lg
      ${inputBgClass}
      ${textClass}
      border
      ${borderClass}
      focus:outline-none
      focus:ring-2
      focus:ring-green-500

    `}
    placeholder="Ask me anything about tax in Nigeria..."
  />

  <button
    onClick={onSend}
    className="
      w-full
      sm:w-auto
      px-4
      sm:px-6
      py-3
      bg-green-600
      text-white
      rounded-lg
      hover:bg-green-700
      transition-colors
      flex
      items-center
      justify-center
      gap-2
      cursor-pointer
    "
  >
    <Send size={18} />
    <span >Send</span>
  </button>
</div>

      
    </div>
  );
}


export default LandingPage;
