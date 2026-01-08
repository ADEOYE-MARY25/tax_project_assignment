import React from 'react';
import { Copy, Check } from 'lucide-react';

function AIMessage({ message, isCopied, onCopy, isDarkMode }) {
  const secondaryBgClass = isDarkMode ? 'bg-green-800' : 'bg-green-100';

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <div className={`${secondaryBgClass} p-4 rounded-lg`}>
          {message.text}
        </div>
        {/* Copy Button and Time Display */}
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={onCopy}
            className="text-sm opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
          <span className="text-sm opacity-50">
            Generated in {message.time}s
          </span>
        </div>
      </div>
    </div>
  );
}

export default AIMessage;
