import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ablyClientManager } from '@/lib/ably-client';
import { debounce } from '@/lib/utils';

interface UseTypingIndicatorParams {
  chatRoomId?: number;
}

interface UseTypingIndicatorReturn {
  isTyping: boolean;
  typingUser: string | null;
  startTyping: () => void;
  stopTyping: () => void;
}

export const useTypingIndicator = ({ chatRoomId }: UseTypingIndicatorParams = {}): UseTypingIndicatorReturn => {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  const user = useSelector((state: RootState) => state.auth?.user);
  
  // Setup typing indicator subscription
  useEffect(() => {
    if (!chatRoomId || !authToken) return;
    
    const channel = ablyClientManager.getChannel(`chat:${chatRoomId}`);
    if (!channel) return;
    
    const onTypingStart = (message: any) => {
      const { userId, userName } = message.data;
      
      // Don't show typing indicator for the current user
      if (userId === user?.id) return;
      
      setIsTyping(true);
      setTypingUser(userName);
      
      // Auto-clear typing indicator after 3 seconds
      setTimeout(() => {
        setIsTyping(false);
        setTypingUser(null);
      }, 3000);
    };
    
    channel.subscribe('typing:start', onTypingStart);
    
    return () => {
      channel.unsubscribe('typing:start', onTypingStart);
    };
  }, [chatRoomId, authToken, user?.id]);
  
  // Debounced function to send typing indicator
  const debouncedSendTypingIndicator = useCallback(
    debounce(() => {
      const channel = ablyClientManager.getChannel(`chat:${chatRoomId}`);
      if (!channel) return;
      
      channel.publish('typing:start', {
        userId: user?.id,
        userName: user?.name,
      });
    }, 500),
    [chatRoomId, user?.id, user?.name]
  );
  
  // Start typing indicator
  const startTyping = useCallback(() => {
    if (!chatRoomId || !authToken || !user) return;
    debouncedSendTypingIndicator();
  }, [chatRoomId, authToken, user, debouncedSendTypingIndicator]);
  
  // Stop typing indicator (not really needed with debounce)
  const stopTyping = useCallback(() => {
    // This is a no-op since we're using debounce
    // Could implement explicit "stopped typing" if needed
  }, []);
  
  return {
    isTyping,
    typingUser,
    startTyping,
    stopTyping,
  };
}; 