import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useChatService } from './use-chat-service';
import { usePollingChat } from './use-polling-chat';
import type { ChatMessage } from '@/types';

interface UseChatMessagesProps {
  chatRoomId?: number;
  isActive?: boolean;
  pageSize?: number;
  initialLoad?: boolean;
}

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  pendingMessages: ChatMessage[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  sendMessage: (content: string) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: () => Promise<void>;
  resetMessages: () => void;
  retryMessage: (messageId: number) => Promise<void>;
}

/**
 * Hook for managing chat messages with polling and optimistic updates
 */
export const useChatMessages = ({
  chatRoomId,
  isActive = true,
  pageSize = 20,
  initialLoad = true
}: UseChatMessagesProps = {}): UseChatMessagesReturn => {
  const chatService = useChatService();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  // Use refs to avoid dependency issues in useEffect cleanup
  const chatRoomIdRef = useRef<number | undefined>(chatRoomId);
  
  // Get current user from Redux store
  const user = useSelector((state: RootState) => state.auth?.user);
  
  // Update refs when props change
  useEffect(() => {
    chatRoomIdRef.current = chatRoomId;
  }, [chatRoomId]);
  
  // Reset state when chat room changes
  useEffect(() => {
    resetMessages();
  }, [chatRoomId]);
  
  // Handle new messages from polling
  const handleNewMessages = useCallback((newMessages: ChatMessage[]) => {
    if (newMessages.length === 0) return;
    
    setMessages(prevMessages => {
      // Create a new array with the new messages
      const updatedMessages = [...prevMessages];
      
      // Process each new message
      newMessages.forEach(newMessage => {
        // Check if this message matches any pending message
        const pendingIndex = pendingMessages.findIndex(
          msg => msg.content === newMessage.content && 
                msg.status === 'pending' &&
                msg.senderType === newMessage.senderType
        );
        
        // If we found a matching pending message, replace it
        if (pendingIndex !== -1) {
          // Remove the pending message from the pending array
          setPendingMessages(prev => prev.filter((_, i) => i !== pendingIndex));
          
          // Find and replace the pending message in the messages array
          const messageIndex = updatedMessages.findIndex(
            msg => msg.id === pendingMessages[pendingIndex].id
          );
          
          if (messageIndex !== -1) {
            updatedMessages[messageIndex] = {
              ...newMessage,
              status: 'delivered'
            };
          } else {
            // If we couldn't find the message in the array (shouldn't happen),
            // just add the new message
            updatedMessages.unshift({
              ...newMessage,
              status: 'delivered'
            });
          }
        } else {
          // Check if the message already exists to avoid duplicates
          const exists = updatedMessages.some(msg => msg.id === newMessage.id);
          
          if (!exists) {
            // Add the new message to the beginning (newest first)
            updatedMessages.unshift({
              ...newMessage,
              status: 'delivered'
            });
          }
        }
      });
      
      // Sort messages by creation time (newest first)
      return updatedMessages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [pendingMessages]);
  
  // Set up polling for new messages
  const { error: pollingError } = usePollingChat({
    chatRoomId,
    isActive,
    onNewMessages: handleNewMessages
  });
  
  // Load initial messages
  useEffect(() => {
    if (!initialLoad || !chatRoomId || !chatService) return;
    
    const loadInitialMessages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await chatService.getChatHistory(chatRoomId);
        
        // Add status to messages
        const messagesWithStatus = data.content.map(msg => ({
          ...msg,
          status: 'delivered' as const
        }));
        
        setMessages(messagesWithStatus);
        setHasMore(data.totalPages > 1);
        setPage(0);
        
        // Mark messages as read
        await chatService.markAsRead(chatRoomId);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to load messages';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialMessages();
  }, [chatRoomId, chatService, initialLoad]);
  
  // Send a message with optimistic update
  const sendMessage = useCallback(async (content: string) => {
    if (!chatRoomId || !content.trim() || !user) {
      return;
    }
    
    const senderType = user.role === 'ROLE_CLIENT' ? 'CLIENT' : 'FREELANCER';
    
    // Create an optimistic message
    const optimisticId = -Date.now(); // Temporary negative ID
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      chatRoomId: chatRoomId,
      senderType: senderType,
      senderId: user.id,
      senderName: user.name || 'You',
      content: content,
      messageType: 'TEXT',
      isRead: false,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    // Add to pending messages
    setPendingMessages(prev => [...prev, optimisticMessage]);
    
    // Add to messages with pending status
    setMessages(prev => [optimisticMessage, ...prev]);
    
    try {
      // Send the message to the server
      const sentMessage = await chatService.sendMessage(chatRoomId, content);
      
      // Update messages to replace the optimistic message with the real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticId
            ? { ...sentMessage, status: 'delivered' }
            : msg
        )
      );
      
      // Remove from pending messages
      setPendingMessages(prev => prev.filter(msg => msg.id !== optimisticId));
    } catch (err: any) {
      // Mark the message as error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticId
            ? { ...msg, status: 'error' }
            : msg
        )
      );
      
      // Update pending message status
      setPendingMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticId
            ? { ...msg, status: 'error' }
            : msg
        )
      );
      
      const errorMsg = err?.message || 'Failed to send message';
      setError(errorMsg);
    }
  }, [chatRoomId, chatService, user]);
  
  // Retry sending a failed message
  const retryMessage = useCallback(async (messageId: number) => {
    // Find the failed message
    const failedMessage = messages.find(msg => msg.id === messageId && msg.status === 'error');
    
    if (!failedMessage || !chatRoomId) {
      return;
    }
    
    // Update the message status to pending
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId
          ? { ...msg, status: 'pending' }
          : msg
      )
    );
    
    try {
      // Resend the message
      const sentMessage = await chatService.sendMessage(chatRoomId, failedMessage.content);
      
      // Update the message with the server response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId
            ? { ...sentMessage, status: 'delivered' }
            : msg
        )
      );
      
      // Remove from pending messages if it exists there
      setPendingMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err: any) {
      // Mark the message as error again
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId
            ? { ...msg, status: 'error' }
            : msg
        )
      );
      
      const errorMsg = err?.message || 'Failed to send message';
      setError(errorMsg);
    }
  }, [messages, chatRoomId, chatService]);
  
  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!chatRoomId || !hasMore || isLoading || isLoadingMore) {
      return;
    }
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const data = await chatService.getChatHistory(chatRoomId, nextPage, pageSize);
      
      // Add status to messages
      const messagesWithStatus = data.content.map(msg => ({
        ...msg,
        status: 'delivered' as const
      }));
      
      // Append new messages to the end (older messages)
      setMessages(prev => [...prev, ...messagesWithStatus]);
      setHasMore(nextPage < data.totalPages - 1);
      setPage(nextPage);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load more messages';
      setError(errorMsg);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatRoomId, chatService, hasMore, isLoading, isLoadingMore, page, pageSize]);
  
  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!chatRoomId) {
      return;
    }
    
    try {
      await chatService.markAsRead(chatRoomId);
    } catch (err: any) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [chatRoomId, chatService]);
  
  // Reset messages state
  const resetMessages = useCallback(() => {
    setMessages([]);
    setPendingMessages([]);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    setPage(0);
    setHasMore(true);
  }, []);
  
  // Update error state if polling has an error
  useEffect(() => {
    if (pollingError) {
      setError(`Polling error: ${pollingError.message}`);
    }
  }, [pollingError]);
  
  return {
    messages,
    pendingMessages,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    sendMessage,
    loadMore,
    markAsRead,
    resetMessages,
    retryMessage
  };
};

export default useChatMessages;