import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BidNegotiationChat } from './BidNegotiationChat';
import { ContractChat } from './ContractChat';
import { fetchUserChatRooms } from '@/store/slices/chat-slice';
import type { AppDispatch, RootState } from '@/store';

export const ChatDetail: React.FC = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { authToken } = useSelector((state: RootState) => state.auth);
  const chatRooms = useSelector((state: RootState) => state.chat.chatRooms);
  const loading = useSelector((state: RootState) => state.chat.loading.chatRooms);
  
  // Find the chat room
  const chatRoom = chatRooms.find(room => room.id === Number(chatRoomId));
  
  // Fetch chat rooms if not loaded
  useEffect(() => {
    if (authToken && (!chatRooms.length || !chatRoom)) {
      dispatch(fetchUserChatRooms({ authToken }));
    }
  }, [authToken, dispatch, chatRooms.length, chatRoom]);
  
  const handleBack = () => {
    navigate('/dashboard/chats');
  };
  
  // Only show loading on initial load when there are no chat rooms at all
  if (loading && chatRooms.length === 0 && !chatRoom) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
        
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p>Loading chat...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!chatRoom) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Chat Not Found</h1>
          </div>
        </div>
        
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-medium mb-2">Chat not found</h3>
              <p className="text-muted-foreground mb-4">
                The chat you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={handleBack}>Return to Chats</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">{chatRoom.otherParty.name}</h1>
          <p className="text-muted-foreground">
            {chatRoom.chatType === 'BID_NEGOTIATION' ? 'Bid Discussion' : 'Contract Chat'}
          </p>
        </div>
      </div>
      
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          {chatRoom.chatType === 'BID_NEGOTIATION' ? (
            <BidNegotiationChat 
              chatRoomId={Number(chatRoomId)} 
              className="h-full" 
            />
          ) : (
            <ContractChat 
              chatRoomId={Number(chatRoomId)} 
              className="h-full" 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatDetail;