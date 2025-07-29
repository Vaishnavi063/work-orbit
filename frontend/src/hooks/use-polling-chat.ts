import { useState, useEffect, useCallback, useRef } from 'react';
import { useChatService } from './use-chat-service';
import type { ChatMessage } from '@/types';

interface UsePollingChatProps {
  chatRoomId?: number;
  isActive?: boolean;
  onNewMessages?: (messages: ChatMessage[]) => void;
}

interface UsePollingChatReturn {
  isPolling: boolean;
  lastPollTime: string | null;
  error: Error | null;
  startPolling: () => void;
  stopPolling: () => void;
  setActive: (isActive: boolean) => void;
}

/**
 * Hook for managing chat message polling
 */
export const usePollingChat = ({
  chatRoomId,
  isActive = true,
  onNewMessages
}: UsePollingChatProps = {}): UsePollingChatReturn => {
  const chatService = useChatService();
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastPollTime, setLastPollTime] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to avoid dependency issues in useEffect cleanup
  const isActiveRef = useRef<boolean>(isActive);
  const chatRoomIdRef = useRef<number | undefined>(chatRoomId);
  
  // Update refs when props change
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);
  
  useEffect(() => {
    chatRoomIdRef.current = chatRoomId;
  }, [chatRoomId]);
  
  // Handle new messages callback
  const handleNewMessages = useCallback((messages: ChatMessage[]) => {
    if (messages.length > 0) {
      // Update last poll time to the most recent message timestamp
      const latestMessage = messages.reduce((latest, message) => {
        return new Date(message.createdAt) > new Date(latest.createdAt) ? message : latest;
      }, messages[0]);
      
      setLastPollTime(latestMessage.createdAt);
      
      // Call the onNewMessages callback if provided
      if (onNewMessages) {
        onNewMessages(messages);
      }
    }
  }, [onNewMessages]);
  
  // Handle polling errors
  const handleError = useCallback((error: Error) => {
    setError(error);
    console.error('Polling error:', error);
  }, []);
  
  // Start polling
  const startPolling = useCallback(() => {
    if (!chatRoomIdRef.current) {
      console.warn('Cannot start polling: No chat room ID provided');
      return;
    }
    
    try {
      chatService.startPolling(
        chatRoomIdRef.current,
        handleNewMessages,
        handleError,
        isActiveRef.current
      );
      
      setIsPolling(true);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to start polling:', err);
    }
  }, [chatService, handleNewMessages, handleError]);
  
  // Stop polling
  const stopPolling = useCallback(() => {
    if (!chatRoomIdRef.current) return;
    
    try {
      chatService.stopPolling(chatRoomIdRef.current);
      setIsPolling(false);
    } catch (err) {
      console.error('Failed to stop polling:', err);
    }
  }, [chatService]);
  
  // Update polling frequency based on active state
  const setActive = useCallback((active: boolean) => {
    if (!chatRoomIdRef.current || !isPolling) return;
    
    isActiveRef.current = active;
    
    try {
      chatService.updatePollingFrequency(
        chatRoomIdRef.current,
        active,
        handleNewMessages,
        handleError
      );
    } catch (err) {
      console.error('Failed to update polling frequency:', err);
    }
  }, [chatService, handleNewMessages, handleError, isPolling]);
  
  // Start polling when chat room ID is provided and component mounts
  useEffect(() => {
    if (chatRoomId) {
      startPolling();
    }
    
    // Cleanup function to stop polling when component unmounts
    return () => {
      if (chatRoomIdRef.current) {
        stopPolling();
      }
    };
  }, [chatRoomId, startPolling, stopPolling]);
  
  return {
    isPolling,
    lastPollTime,
    error,
    startPolling,
    stopPolling,
    setActive
  };
};

export default usePollingChat;