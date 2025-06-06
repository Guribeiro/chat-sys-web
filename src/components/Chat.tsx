
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Message, { MessageType } from './Message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageCircle, Send, Users } from 'lucide-react';

const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers] = useState(['Alice', 'Bob', 'Charlie', 'Diana']);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample initial messages
  useEffect(() => {
    const initialMessages: MessageType[] = [
      {
        id: '1',
        username: 'Alice',
        content: 'Hey everyone! Welcome to the chat room! 👋',
        timestamp: new Date(Date.now() - 300000),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
      },
      {
        id: '2',
        username: 'Bob',
        content: 'Great to be here! Looking forward to chatting with you all.',
        timestamp: new Date(Date.now() - 240000),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
      },
      {
        id: '3',
        username: 'Charlie',
        content: 'This chat app looks amazing! Love the design. 🎨',
        timestamp: new Date(Date.now() - 180000),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
      }
    ];
    setMessages(initialMessages);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      const message: MessageType = {
        id: Date.now().toString(),
        username: user.username,
        content: newMessage.trim(),
        timestamp: new Date(),
        avatar: user.avatar,
        isCurrentUser: true
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      console.log('Message sent:', message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ChatRoom</h1>
              <p className="text-sm text-gray-500">{onlineUsers.length + 1} members online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-8 h-8 rounded-full border-2 border-gray-200"
              />
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              Leave Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Online Users Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-700">Online Now</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-blue-600">{user?.username} (You)</span>
              </div>
              {onlineUsers.map((username) => (
                <div key={username} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                    alt={username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600">{username}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col h-[600px]">
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-1">
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={{
                    ...message,
                    isCurrentUser: message.username === user?.username
                  }}
                />
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
