import React from 'react';
import UserMessage from './UserMessage';
import AIMessage from './AIMessage';
import LoadingAnimation from './LoadingAnimation';
import InputBar from './InputBar';

function ChatPage({ 
  messages, 
  isLoading, 
  loadingTime, 
  inputMessage, 
  editingMessageId,
  editedText,
  copiedMessageId,
  onInputChange, 
  onSend,
  onEditMessage,
  onEditChange,
  onRegenerateResponse,
  onCancelEdit,
  onCopyMessage,
  isDarkMode 
}) {
  
  return (
    <div className="mt-8 p-4" >
      <div className="space-y-6 mb-6">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === 'user' ? (
              <UserMessage
                message={message}
                isEditing={editingMessageId === message.id}
                editedText={editedText}
                onEditClick={() => onEditMessage(message.id, message.text)}
                onEditChange={onEditChange}
                onRegenerate={() => onRegenerateResponse(message.id)}
                onCancelEdit={onCancelEdit}
                isDarkMode={isDarkMode}
              />
            ) : (
              <AIMessage
                message={message}
                isCopied={copiedMessageId === message.id}
                onCopy={() => onCopyMessage(message.text, message.id)}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        ))}
        
        {isLoading && (
          <LoadingAnimation loadingTime={loadingTime} isDarkMode={isDarkMode} />
        )}
      </div>

      <InputBar
        inputMessage={inputMessage}
        onInputChange={onInputChange}
        onSend={onSend}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default ChatPage;

