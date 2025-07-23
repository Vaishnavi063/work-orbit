import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { chatApis } from '@/features/chat/apis';
import type { ChatMessage } from '@/types';
import { ablyClientManager, AblyChannelUtils } from '@/lib/ably-client';

// Add a custom property to ChatMessage for pending status
interface OptimisticChatMessage extends ChatMessage {
  isPending?: boolean;
}

interface UseChatParams {
  chatRoomId?: number;
  chatType?: 'BID_NEGOTIATION' | 'CONTRACT';
  referenceId?: number;
}

interface UseChatReturn {
  messages: OptimisticChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useChat = ({ chatRoomId, chatType, referenceId }: UseChatParams = {}): UseChatReturn => {
  const [messages, setMessages] = useState<OptimisticChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  const user = useSelector((state: RootState) => state.auth?.user);
  
  // Load initial messages
  useEffect(() => {
    if (!chatRoomId || !authToken || !chatType || !referenceId) return;
    
    const loadInitialMessages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await chatApis.getChatHistory({
          chatRoomId,
          page: 0,
          size: 20,
          authToken,
        });
        
        const data = response.data.data;
        setMessages(data.content);
        setHasMore(data.totalPages > 1);
        setPage(0);
        
        // Mark messages as read
        await chatApis.markAsRead({ chatRoomId, authToken });
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialMessages();
    
    // Subscribe to real-time updates using correct channel name
    const channelName = AblyChannelUtils.createChannelName(chatType, referenceId);
    const channel = ablyClientManager.getChannel(channelName);
    if (channel) {
      const onMessage = (message: any) => {
        const newMessage = message.data as ChatMessage;
        setMessages(prev => [newMessage, ...prev]);
      };
      
      channel.subscribe('message', onMessage);
      
      return () => {
        channel.unsubscribe('message', onMessage);
      };
    }
  }, [chatRoomId, authToken, chatType, referenceId]);
  
  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!chatRoomId || !authToken || !content.trim() || !user) return;
    
    const senderType = user.role === 'ROLE_CLIENT' ? 'CLIENT' : 'FREELANCER';
    
    const optimisticMessage: OptimisticChatMessage = {
      id: -Date.now(),
      chatRoomId: chatRoomId,
      senderType: senderType,
      senderId: user.id,
      senderName: user.name || 'You',
      content: content,
      messageType: 'TEXT',
      isRead: false,
      isPending: true,
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [optimisticMessage, ...prev]);
    
    try {
      await chatApis.sendMessage({
        chatRoomId,
        content,
        authToken,
      });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to send message');
    }
  }, [chatRoomId, authToken, user]);
  
  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!chatRoomId || !authToken) return;
    
    try {
      await chatApis.markAsRead({ chatRoomId, authToken });
    } catch (err: any) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [chatRoomId, authToken]);
  
  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!chatRoomId || !authToken || !hasMore || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const nextPage = page + 1;
      const response = await chatApis.getChatHistory({
        chatRoomId,
        page: nextPage,
        size: 20,
        authToken,
      });
      
      const data = response.data.data;
      setMessages(prev => [...prev, ...data.content]);
      setHasMore(nextPage < data.totalPages - 1);
      setPage(nextPage);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load more messages');
    } finally {
      setIsLoading(false);
    }
  }, [chatRoomId, authToken, hasMore, isLoading, page]);
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    hasMore,
    loadMore,
  };
}; 