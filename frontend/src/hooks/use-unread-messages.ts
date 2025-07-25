import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserChatRooms, selectTotalUnreadCount } from '@/store/slices/chat-slice';
import type { RootState, AppDispatch } from '@/store';

interface UseUnreadMessagesProps {
  pollingInterval?: number;
}

/**
 * Hook for managing unread message counts with polling
 */
export const useUnreadMessages = ({ 
  pollingInterval = 30000 // Default to 30 seconds
}: UseUnreadMessagesProps = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { authToken } = useSelector((state: RootState) => state.auth);
  const totalUnreadCount = useSelector(selectTotalUnreadCount);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  
  // Start polling for unread messages
  useEffect(() => {
    if (!authToken) return;
    
    // Initial fetch
    dispatch(fetchUserChatRooms({ authToken }));
    setIsPolling(true);
    
    // Set up polling interval
    const intervalId = setInterval(() => {
      dispatch(fetchUserChatRooms({ authToken }));
    }, pollingInterval);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [authToken, dispatch, pollingInterval]);
  
  return {
    totalUnreadCount,
    isPolling
  };
};

export default useUnreadMessages;