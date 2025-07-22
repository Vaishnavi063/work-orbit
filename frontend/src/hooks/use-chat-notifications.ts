import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { chatApis } from '@/features/chat/apis';
import type { ChatMessage, ChatRoom } from '@/types';
import { useAblyChat } from './use-ably-chat';

interface UseChatNotificationsParams {
  onNewMessage?: (message: ChatMessage, chatRoomId: number) => void;
  requestNotificationPermission?: boolean;
}

interface UseChatNotificationsReturn {
  unreadCount: number;
  chatRooms: ChatRoom[];
  isLoading: boolean;
  error: string | null;
  refreshChatRooms: () => Promise<void>;
  markAsRead: (chatRoomId: number) => Promise<void>;
  notificationsEnabled: boolean;
  requestPermission: () => Promise<boolean>;
}

/**
 * Hook for managing chat notifications and unread message counts
 */
export const useChatNotifications = ({
  onNewMessage,
  requestNotificationPermission = false
}: UseChatNotificationsParams = {}): UseChatNotificationsReturn => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  const user = useSelector((state: RootState) => state.auth?.user);
  
  // Connect to the user's notification channel
  useAblyChat({
    channelName: user?.id ? `user:${user.id}:notifications` : undefined,
    messageType: 'chat:new-message',
    onMessageReceived: (message: any) => {
      // Handle new message notification
      if (message && message.chatRoomId && onNewMessage) {
        onNewMessage(message, message.chatRoomId);
        
        // Show browser notification if enabled
        if (notificationsEnabled && document.visibilityState === 'hidden') {
          const notification = new Notification('New Message', {
            body: `${message.senderName}: ${message.content}`,
            icon: '/logo.png',
            tag: `chat-${message.chatRoomId}`,
          });
          
          // Close notification after 5 seconds
          setTimeout(() => notification.close(), 5000);
          
          // Focus window when notification is clicked
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        }
        
        // Update unread count
        refreshChatRooms();
      }
    }
  });
  
  // Check notification permission on mount
  useEffect(() => {
    const checkNotificationPermission = () => {
      if (!('Notification' in window)) {
        return;
      }
      
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission !== 'denied' && requestNotificationPermission) {
        requestPermission();
      }
    };
    
    checkNotificationPermission();
  }, [requestNotificationPermission]);
  
  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setNotificationsEnabled(granted);
      return granted;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
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