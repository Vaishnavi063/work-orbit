import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { getChatService } from '@/features/chat/services';

/**
 * Hook to access the ChatService instance with the current auth token
 */
export const useChatService = () => {
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  
  // Create or get ChatService instance with current auth token
  const chatService = useMemo(() => {
    if (!authToken) {
      throw new Error('Cannot use chat service: User not authenticated');
    }
    return getChatService(authToken);
  }, [authToken]);
  
  return chatService;
};

export default useChatService;