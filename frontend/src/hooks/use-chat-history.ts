import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { chatApis } from '@/features/chat/apis';
import type { ChatMessage } from '@/types';
import { useErrorHandler } from './use-error-handler';

interface UseChatHistoryParams {
  chatRoomId?: number;
  pageSize?: number;
  initialLoad?: boolean;
}

interface UseChatHistoryReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  resetHistory: () => void;
}

/**
 * Hook for managing chat message history with pagination
 */
export const useChatHistory = ({
  chatRoomId,
  pageSize = 20,
  initialLoad = true
}: UseChatHistoryParams = {}): UseChatHistoryReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { handleError } = useErrorHandler();
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  
  // Reset state when chat room changes
  useEffect(() => {
    resetHistory();
  }, [chatRoomId]);
  
  // Load initial messages
  useEffect(() => {
    if (!initialLoad || !chatRoomId || !authToken) return;
    
    const loadInitialMessages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await chatApis.getChatHistory({
          chatRoomId,
          page: 0,
          size: pageSize,
          authToken,
        });
        
        const data = response.data.data;
        setMessages(data.content);
        setHasMore(data.totalPages > 1);
        setPage(0);
      } catch (err: any) {
        const errorMsg = err?.response?.data?.error?.message || 'Failed to load messages';
        setError(errorMsg);
        handleError(errorMsg, { showToast: false });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialMessages();
  }, [chatRoomId, authToken, pageSize, initialLoad, handleError]);
  
  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!chatRoomId || !authToken || !hasMore || isLoading || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const response = await chatApis.getChatHistory({
        chatRoomId,
        page: nextPage,
        size: pageSize,
        authToken,
      });
      
      const data = response.data.data;
      
      // Append new messages to the end (older messages)
      setMessages(prev => [...prev, ...data.content]);
      setHasMore(nextPage < data.totalPages - 1);
      setPage(nextPage);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error?.message || 'Failed to load more messages';
      setError(errorMsg);
      handleError(errorMsg, { showToast: false });
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatRoomId, authToken, hasMore, isLoading, isLoadingMore, page, pageSize, handleError]);
  
  // Add a new message to the history (typically from real-time updates)
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const messageExists = prev.some(m => m.id === message.id);
      if (messageExists) return prev;
      
      // Add new message at the beginning (newest messages first)
      return [message, ...prev];
    });
  }, []);
  
  // Reset history state
  const resetHistory = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    setPage(0);
    setHasMore(true);
  }, []);
  
  return {
    messages,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    addMessage,
    resetHistory,
  };
}; 