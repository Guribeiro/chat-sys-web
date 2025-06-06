
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Message, { MessageType } from './Message';
import ChannelSidebar from './ChannelSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageCircle, Send, Users, Hash } from 'lucide-react';

const Chat: React.FC = () => {
  const { user, logout, currentChannel } = useAuth();
  const [messages, setMessages] = useState<Record<string, MessageType[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers] = useState(['Alice', 'Bob', 'Charlie', 'Diana']);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample initial messages for different channels
  useEffect(() => {
    const initialMessages: Record<string, MessageType[]> = {
      '1': [
        {
          id: '1',
          username: 'Alice',
          content: 'Welcome to the general channel! 👋',
          timestamp: new Date(Date.now() - 300000),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
        },
        {
          id: '2',
          username: 'Bob',
          content: 'Great to have everyone here!',
          timestamp: new Date(Date.now() - 240000),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
        }
      ],
      '2': [
        {
          id: '3',
          username: 'Charlie',
          content: 'Random thoughts and fun conversations here! 🎉',
          timestamp: new Date(Date.now() - 180000),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
        }
      ],
      '3': [
        {
          id: '4',
          username: 'Diana',
          content: 'Let\'s discuss the latest in technology! 💻',
          timestamp: new Date(Date.now() - 120000),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana'
        }
      ]
    };
    setMessages(initialMessages);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user && currentChannel) {
      const message: MessageType = {
        id: Date.now().toString(),
        username: user.username,
        content: newMessage.trim(),
        timestamp: new Date(),
        avatar: user.avatar,
        isCurrentUser: true
      };
      
      setMessages(prev => ({
        ...prev,
        [currentChannel.id]: [...(prev[currentChannel.id] || []), message]
      }));
      setNewMessage('');
      console.log('Message sent:', message);
    }
  };

  const currentMessages = currentChannel ? messages[currentChannel.id] || [] : [];

  if (!currentChannel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Hash className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to ChatRoom</h2>
          <p className="text-gray-600">Select a channel to start chatting!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                # {currentChannel.name}
              </h1>
              <p className="text-sm text-gray-500">
                {currentChannel.description || `${onlineUsers.length + 1} members online`}
              </p>
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

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Channels Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <ChannelSidebar />
            
            {/* Online Users */}
            <Card className="h-fit">
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
          </div>

          {/* Chat Area */}
          <Card className="lg:col-span-4 flex flex-col h-[600px]">
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-1">
              {currentMessages.map((message) => (
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
                  placeholder={`Message #${currentChannel.name}...`}
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
