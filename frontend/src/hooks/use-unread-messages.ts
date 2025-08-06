import { useSelector } from 'react-redux';
import { selectTotalUnreadCount } from '@/store/slices/chat-slice';
import { useChatPolling } from '@/hooks/use-chat-polling';

interface UseUnreadMessagesProps {
  pollingInterval?: number;
}

/**
 * Hook for managing unread message counts with centralized polling
 * Now uses the centralized ChatPollingService for efficient polling
 */
export const useUnreadMessages = ({ 
  pollingInterval = 30000 // Default to 30 seconds
}: UseUnreadMessagesProps = {}) => {
  const totalUnreadCount = useSelector(selectTotalUnreadCount);
  
  // Use centralized chat polling service
  // Convert pollingInterval to visible/hidden intervals for backward compatibility
  const { isPolling } = useChatPolling({
    fetchType: 'all',
    visibleInterval: pollingInterval,
    hiddenInterval: pollingInterval,
    enabled: true
  });
  
  return {
    totalUnreadCount,
    isPolling
  };
};

export default useUnreadMessages;