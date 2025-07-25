import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { chatApis } from '@/features/chat/apis';

interface MilestoneNotification {
  id: number;
  title: string;
  status: string;
  action: string;
}

interface UseMilestoneNotificationsProps {
  chatRoomId: number;
}

/**
 * Hook for managing milestone notifications in chat
 */
export const useMilestoneNotifications = ({ chatRoomId }: UseMilestoneNotificationsProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentNotification, setCurrentNotification] = useState<MilestoneNotification | null>(null);
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  
  // Send milestone notification to chat
  const sendMilestoneNotification = useCallback(async (notification: MilestoneNotification) => {
    if (!authToken || !chatRoomId) {
      setError('Authentication or chat room ID missing');
      return;
    }
    
    try {
      setIsLoading(true);
      setCurrentNotification(notification);
      setError(null);
      
      // Format notification message based on action type
      let notificationMessage = '';
      switch (notification.action) {
        case 'created':
          notificationMessage = `New milestone created: "${notification.title}"`;
          break;
        case 'updated':
          notificationMessage = `Milestone "${notification.title}" was updated`;
          break;
        case 'status_change':
          notificationMessage = `Milestone "${notification.title}" status changed to ${notification.status}`;
          break;
        case 'deleted':
          notificationMessage = `Milestone "${notification.title}" was deleted`;
          break;
        default:
          notificationMessage = `Milestone update: "${notification.title}"`;
      }
      
      // Send notification to chat
      await chatApis.sendMilestoneNotification(chatRoomId, notificationMessage, authToken);
      
      // Clear notification after a delay
      setTimeout(() => {
        setCurrentNotification(null);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to send milestone notification:', err);
      setError(err?.message || 'Failed to send milestone notification');
    } finally {
      setIsLoading(false);
    }
  }, [chatRoomId, authToken]);
  
  // Update milestone status with notification
  const updateMilestoneStatus = useCallback(async (
    milestoneId: number, 
    title: string, 
    status: string
  ) => {
    if (!authToken || !chatRoomId) {
      setError('Authentication or chat room ID missing');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Update milestone status
      await chatApis.updateMilestoneStatusFromChat(chatRoomId, milestoneId, status, authToken);
      
      // Send notification
      await sendMilestoneNotification({
        id: milestoneId,
        title,
        status,
        action: 'status_change'
      });
    } catch (err: any) {
      console.error('Failed to update milestone status:', err);
      setError(err?.message || 'Failed to update milestone status');
    } finally {
      setIsLoading(false);
    }
  }, [chatRoomId, authToken, sendMilestoneNotification]);
  
  // Create milestone with notification
  const createMilestone = useCallback(async (milestoneData: any) => {
    if (!authToken || !chatRoomId) {
      setError('Authentication or chat room ID missing');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create milestone
      const response = await chatApis.createMilestoneFromChat(chatRoomId, milestoneData, authToken);
      
      if (response.data.status === 'success') {
        // Send notification
        await sendMilestoneNotification({
          id: response.data.data.id,
          title: milestoneData.title,
          status: 'PENDING',
          action: 'created'
        });
        
        return response.data.data;
      } else {
        setError(response.data.error?.message || 'Failed to create milestone');
        return null;
      }
    } catch (err: any) {
      console.error('Failed to create milestone:', err);
      setError(err?.message || 'Failed to create milestone');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [chatRoomId, authToken, sendMilestoneNotification]);
  
  return {
    isLoading,
    error,
    currentNotification,
    sendMilestoneNotification,
    updateMilestoneStatus,
    createMilestone,
    clearError: () => setError(null)
  };
};

export default useMilestoneNotifications;