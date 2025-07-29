import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { chatApis } from '@/features/chat/apis';
import type { ChatRoom } from '@/types';

interface UseChatNotificationsParams {
}

interface UseChatNotificationsReturn {
  unreadCount: number;
  chatRooms: ChatRoom[];
  isLoading: boolean;
  error: string | null;
  refreshChatRooms: () => Promise<void>;
  markAsRead: (chatRoomId: number) => Promise<void>;
  notificationsEnabled: boolean; // Always false now
  requestPermission: () => Promise<boolean>; // Always returns false
}

/**
 * Hook for managing chat notifications and unread message counts
 */
export const useChatNotifications = (
  _params: UseChatNotificationsParams = {}
): UseChatNotificationsReturn => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Notifications are always disabled
  const notificationsEnabled = false;
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  
  
  
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return false;
  }, []);
  
  // Load chat rooms and calculate unread count
  const refreshChatRooms = useCallback(async () => {
    if (!authToken) return;
    
    setIsLoading(true);
    
    try {
      const response = await chatApis.getUserChatRooms(authToken);
      const rooms = response.data.data;
      
      setChatRooms(rooms);
      
      // Calculate total unread count
      const totalUnread = rooms.reduce((total: number, room: ChatRoom) => total + (room.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load chat rooms');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);
  
  // Load chat rooms on mount and when auth token changes
  useEffect(() => {
    if (authToken) {
      refreshChatRooms();
    } else {
      setChatRooms([]);
      setUnreadCount(0);
    }
  }, [authToken, refreshChatRooms]);
  
  // Mark messages as read
  const markAsRead = useCallback(async (chatRoomId: number) => {
    if (!authToken) return;
    
    try {
      await chatApis.markAsRead({ chatRoomId, authToken });
      
      // Update local state
      setChatRooms(prev => 
        prev.map(room => 
          room.id === chatRoomId ? { ...room, unreadCount: 0 } : room
        )
      );
      
      // Recalculate total unread count
      setUnreadCount(prev => {
        const roomToUpdate = chatRooms.find(r => r.id === chatRoomId);
        return prev - (roomToUpdate?.unreadCount || 0);
      });
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [authToken, chatRooms]);
  
  return {
    unreadCount,
    chatRooms,
    isLoading,
    error,
    refreshChatRooms,
    markAsRead,
    notificationsEnabled,
    requestPermission
  };
}; 