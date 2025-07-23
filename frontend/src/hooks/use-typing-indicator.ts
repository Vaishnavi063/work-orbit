import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ablyClientManager, AblyChannelUtils } from '@/lib/ably-client';
import { debounce } from '@/lib/utils';

interface UseTypingIndicatorParams {
  chatRoomId?: number;
  chatType?: 'BID_NEGOTIATION' | 'CONTRACT';
  referenceId?: number;
}

interface UseTypingIndicatorReturn {
  isTyping: boolean;
  typingUser: string | null;
  startTyping: () => void;
  stopTyping: () => void;
}

export const useTypingIndicator = ({ chatRoomId, chatType, referenceId }: UseTypingIndicatorParams = {}): UseTypingIndicatorReturn => {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  const user = useSelector((state: RootState) => state.auth?.user);
  
  // Setup typing indicator subscription
  useEffect(() => {
    if (!chatRoomId || !authToken || !chatType || !referenceId) return;
    
    const channelName = AblyChannelUtils.createChannelName(chatType, referenceId);
    const typingChannelName = AblyChannelUtils.createTypingChannelName(channelName);
    const channel = ablyClientManager.getChannel(typingChannelName);
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
  }, [chatRoomId, authToken, chatType, referenceId, user?.id]);
  
  // Debounced function to send typing indicator
  const debouncedSendTypingIndicator = useCallback(
    debounce(() => {
      if (!chatType || !referenceId) return;
      
      const channelName = AblyChannelUtils.createChannelName(chatType, referenceId);
      const typingChannelName = AblyChannelUtils.createTypingChannelName(channelName);
      const channel = ablyClientManager.getChannel(typingChannelName);
      if (!channel) return;
      
      channel.publish('typing:start', {
        userId: user?.id,
        userName: user?.name,
      });
    }, 500),
    [chatRoomId, chatType, referenceId, user?.id, user?.name]
  );
  
  // Start typing indicator
  const startTyping = useCallback(() => {
    if (!chatRoomId || !authToken || !user || !chatType || !referenceId) return;
    debouncedSendTypingIndicator();
  }, [chatRoomId, authToken, user, chatType, referenceId, debouncedSendTypingIndicator]);
  
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