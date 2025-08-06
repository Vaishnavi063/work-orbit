import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { ChatList } from './ChatList';
import { ChatDetail } from './ChatDetail';
import { useChatPolling } from '@/hooks/use-chat-polling';

const ChatPage: React.FC = () => {
  return (
    <div className="container py-6 max-w-7xl mx-auto h-[calc(100vh-10rem)]">
      <Routes>
        <Route path="/" element={<ChatListPage />} />
        <Route path="/:chatRoomId" element={<ChatDetail />} />
      </Routes>
    </div>
  );
};

const ChatListPage: React.FC = () => {
  // Use centralized chat polling service for initial data loading
  useChatPolling({
    fetchType: 'all',
    visibleInterval: 10000,
    hiddenInterval: 30000,
    enabled: true
  });
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Conversations</h1>
        <p className="text-muted-foreground">Manage your chats with clients and freelancers</p>
      </div>
      
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <ChatList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;