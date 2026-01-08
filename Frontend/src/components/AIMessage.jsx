// import React from 'react';
// import { Copy, Check } from 'lucide-react';

// function AIMessage({ message, isCopied, onCopy, isDarkMode }) {
//   const secondaryBgClass = isDarkMode ? 'bg-green-800' : 'bg-green-100';

//   return (
//     <div className="flex justify-start">
//       <div className="max-w-2xl">
//         <div className={`${secondaryBgClass} p-4 rounded-lg`}>
//           {message.text}
//         </div>

//         <div className={`${secondaryBgClass} p-4 rounded-lg`}>
//           {message.citation}
//         </div>
//         {/* Copy Button and Time Display */}
//         <div className="mt-2 flex items-center gap-4">
//           <button
//             onClick={onCopy}
//             className="text-sm opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
//           >
//             {isCopied ? (
//               <>
//                 <Check size={14} />
//                 Copied!
//               </>
//             ) : (
//               <>
//                 <Copy size={14} />
//                 Copy
//               </>
//             )}
//           </button>
//           <span className="text-sm opacity-50">
//             Generated in {message.time}s
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AIMessage;

// src/components/AIMessage.jsx
import React from 'react';
import { Copy, Check } from 'lucide-react';

function AIMessage({ message, isCopied, onCopy, isDarkMode }) {
  const bgClass = isDarkMode ? 'bg-green-800' : 'bg-green-100';
  const textClass = isDarkMode ? 'text-green-100' : 'text-green-900';
  const borderClass = isDarkMode ? 'border-green-700' : 'border-green-300';

  // Use msg.metadata?.citations — this is what your backend sends!
  const citations = message.metadata?.citations || [];

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-3xl w-full">
        {/* Main AI Response (Multilingual) */}
        <div className={`${bgClass} ${textClass} p-5 rounded-lg shadow-sm`}>
          <pre className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
            {message.text}
          </pre>
        </div>

        {/* Citations Section — Now correctly using metadata.citations */}
        {citations.length > 0 && (
          <div className={`mt-4 p-4 rounded-lg border ${borderClass} bg-opacity-50 ${bgClass}`}>
            <p className={`text-xs font-bold mb-3 opacity-90`}>
              Sources:
            </p>
            <ul className="text-xs space-y-2 opacity-80">
              {citations.map((citation, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 mt-1 text-green-500">•</span>
                  <span>
                    <span className="font-medium capitalize">
                      {citation.document_type || 'document'}
                    </span>
                    :{' '}
                    {citation.source_path
                      .split(/[\\/]/)
                      .pop()
                      ?.replace('.pdf', '')}
                    {citation.page_number && (
                      <span className="text-green-600">
                        {' '}
                        (Page {citation.page_number})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Copy Button + Time */}
        <div className="mt-3 flex items-center gap-4 text-xs opacity-70">
          <button
            onClick={onCopy}
            className="flex items-center gap-1 hover:opacity-100 transition-opacity cursor-pointer"
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

          <span>
            Generated in {message.time || '1.0'}s
          </span>
        </div>
      </div>
    </div>
  );
}

export default AIMessage;