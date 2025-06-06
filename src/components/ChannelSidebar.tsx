
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Hash, Plus } from 'lucide-react';

const ChannelSidebar: React.FC = () => {
  const { channels, currentChannel, setCurrentChannel, createChannel } = useAuth();
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      createChannel(newChannelName.trim(), newChannelDescription.trim() || undefined);
      setNewChannelName('');
      setNewChannelDescription('');
      setIsDialogOpen(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-gray-700">Channels</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Channel</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Channel Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. announcements"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description (optional)</label>
                  <Input
                    type="text"
                    placeholder="What's this channel about?"
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">Create Channel</Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setCurrentChannel(channel)}
            className={`w-full text-left p-2 rounded-lg transition-colors ${
              currentChannel?.id === channel.id
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span className="text-sm">{channel.name}</span>
            </div>
            {channel.description && (
              <p className="text-xs text-gray-500 ml-6 mt-1">{channel.description}</p>
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default ChannelSidebar;
