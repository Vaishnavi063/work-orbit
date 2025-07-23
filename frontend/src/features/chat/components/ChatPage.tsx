import React from 'react';
import { Routes, Route } from 'react-router-dom';

const ChatPage: React.FC = () => {
  return (
    <div className="chat-page">
      <h1>Chats</h1>
      <Routes>
        <Route path="/" element={<ChatList />} />
        <Route path="/:chatRoomId" element={<ChatDetail />} />
      </Routes>
    </div>
  );
};

// Placeholder components - these will be implemented in future tasks
const ChatList: React.FC = () => {
  return <div>Chat List - To be implemented</div>;
};

const ChatDetail: React.FC = () => {
  return <div>Chat Detail - To be implemented</div>;
};

export default ChatPage;