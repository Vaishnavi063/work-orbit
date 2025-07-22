import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { chatApis } from '@/features/chat/apis';
import type { ChatMessage } from '@/types';
import { ablyClientManager } from '@/lib/ably-client';

interface UseChatParams {
  chatRoomId?: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useChat = ({ chatRoomId }: UseChatParams = {}): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  
  // Load initial messages
  useEffect(() => {
    if (!chatRoomId || !authToken) return;
    
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
    
    // Subscribe to real-time updates
    const channel = ablyClientManager.getChannel(`chat:${chatRoomId}`);
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
  }, [chatRoomId, authToken]);
  
  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!chatRoomId || !authToken || !content.trim()) return;
    
    try {
      await chatApis.sendMessage({
        chatRoomId,
        content,
        authToken,
      });
      // The message will be added via the real-time subscription
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to send message');
    }
  }, [chatRoomId, authToken]);
  
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