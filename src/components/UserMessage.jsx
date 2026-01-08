import React from 'react';
import { Edit2 } from 'lucide-react';

function UserMessage({ message, isEditing, editedText, onEditClick, onEditChange, onRegenerate, onCancelEdit, isDarkMode }) {
  const secondaryBgClass = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  const inputBgClass = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';

  return (
    <div className="flex justify-end">
      <div className="max-w-2xl">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => onEditChange(e.target.value)}
              className={`w-full p-3 rounded-lg ${inputBgClass} ${textClass} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows="3"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={onRegenerate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Regenerate
              </button>
              <button
                onClick={onCancelEdit}
                className={`px-4 py-2 ${secondaryBgClass} rounded-lg hover:opacity-80 transition-opacity cursor-pointer`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // Display Mode
          <>
            <div className="bg-green-600 text-white p-4 rounded-lg">
              {message.text}
            </div>
            {/* Edit Button */}
            <button
              onClick={onEditClick}
              className="mt-2 text-sm opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
            >
              <Edit2 size={14} />
              Edit & Regenerate
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default UserMessage;
