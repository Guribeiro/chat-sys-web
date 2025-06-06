
import React from 'react';

export interface MessageType {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  avatar?: string;
  isCurrentUser?: boolean;
}

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { username, content, timestamp, avatar, isCurrentUser } = message;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {!isCurrentUser && (
          <img
            src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
            alt={username}
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          />
        )}
        
        <div className={`relative px-4 py-2 rounded-2xl shadow-md ${
          isCurrentUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
            : 'bg-white text-gray-800 border border-gray-200'
        }`}>
          {!isCurrentUser && (
            <p className="text-xs font-medium text-gray-500 mb-1">{username}</p>
          )}
          <p className="text-sm leading-relaxed">{content}</p>
          <p className={`text-xs mt-1 ${
            isCurrentUser ? 'text-blue-100' : 'text-gray-400'
          }`}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Message;
