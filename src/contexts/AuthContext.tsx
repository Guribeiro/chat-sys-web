
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  channels: Channel[];
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel) => void;
  createChannel: (name: string, description?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([
    { id: '1', name: 'general', description: 'General discussion' },
    { id: '2', name: 'random', description: 'Random conversations' },
    { id: '3', name: 'tech-talk', description: 'Technology discussions' }
  ]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  const login = (username: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };
    setUser(newUser);
    setCurrentChannel(channels[0]); // Set default channel
    console.log('User logged in:', newUser);
  };

  const logout = () => {
    setUser(null);
    setCurrentChannel(null);
    console.log('User logged out');
  };

  const createChannel = (name: string, description?: string) => {
    const newChannel: Channel = {
      id: Date.now().toString(),
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description
    };
    setChannels(prev => [...prev, newChannel]);
    setCurrentChannel(newChannel);
    console.log('Channel created:', newChannel);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      channels,
      currentChannel,
      setCurrentChannel,
      createChannel
    }}>
      {children}
    </AuthContext.Provider>
  );
};
