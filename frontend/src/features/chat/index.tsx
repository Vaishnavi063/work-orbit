import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { chatApis } from './apis';
import { ChatInterface } from './components';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { RootState } from '@/store';
import type { ChatRoom } from '@/types';

export default function ChatPage() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load chat rooms
  useEffect(() => {
    if (!authToken) return;
    
    const loadChatRooms = async () => {
      try {
        setIsLoading(true);
        const response = await chatApis.getUserChatRooms(authToken);
        setChatRooms(response.data.data);
        
        // If no chatRoomId is provided, navigate to the first chat room
        if (!chatRoomId && response.data.data.length > 0) {
          navigate(`/chat/${response.data.data[0].id}`);
        }
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Failed to load chat rooms');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChatRooms();
  }, [authToken, chatRoomId, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-destructive">
        {error}
      </div>
    );
  }
  
  if (chatRooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        No chat rooms available.
      </div>
    );
  }
  
  return (
    <div className="container py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Chat rooms sidebar */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {chatRooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => navigate(`/chat/${room.id}`)}
                  className={`w-full px-4 py-3 text-left hover:bg-accent flex items-center justify-between ${
                    chatRoomId === room.id.toString() ? 'bg-accent' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium">{room.otherParty.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {room.lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                  
                  {room.unreadCount > 0 && (
                    <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {room.unreadCount}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Chat interface */}
      <div className="md:col-span-2">
        {chatRoomId ? (
          <ChatInterface chatRoomId={parseInt(chatRoomId, 10)} />
        ) : (
          <div className="flex items-center justify-center h-[600px] text-muted-foreground">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
} 