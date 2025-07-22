import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ablyClientManager, type Ably } from '@/lib/ably-client';
import type { ChatMessage } from '@/types';
import { useErrorHandler } from './use-error-handler';

interface UseAblyChatParams {
  channelName?: string;
  messageType?: string;
  onMessageReceived?: (message: ChatMessage) => void;
}

interface UseAblyChatReturn {
  channel: Ably.RealtimeChannel | null;
  isConnected: boolean;
  publishMessage: (eventName: string, data: any) => Promise<boolean>;
  subscribeToEvent: (eventName: string, callback: (message: any) => void) => void;
  unsubscribeFromEvent: (eventName: string, callback?: (message: any) => void) => void;
  error: string | null;
}

/**
 * Hook for managing Ably real-time chat functionality
 */
export const useAblyChat = ({
  channelName,
  messageType = 'message',
  onMessageReceived
}: UseAblyChatParams = {}): UseAblyChatReturn => {
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuth);
  
  // Initialize channel when channelName changes or auth state changes
  useEffect(() => {
    if (!isAuthenticated || !authToken || !channelName) {
      setChannel(null);
      setIsConnected(false);
      return;
    }
    
    const initializeChannel = async () => {
      try {
        // Ensure Ably client is initialized
        if (!ablyClientManager.isReady()) {
          await ablyClientManager.initialize(authToken);
        }
        
        // Get channel
        const newChannel = ablyClientManager.getChannel(channelName);
        setChannel(newChannel);
        
        // Check if channel is connected
        if (newChannel) {
          const connectionStatus = ablyClientManager.getConnectionStatus();
          setIsConnected(connectionStatus.isConnected);
        }
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to initialize Ably channel';
        setError(errorMsg);
        handleError(errorMsg, { showToast: false });
      }
    };
    
    initializeChannel();
    
    // Cleanup function
    return () => {
      if (channel) {
        // Unsubscribe from all events
        channel.unsubscribe();
      }
    };
  }, [channelName, authToken, isAuthenticated, handleError]);
  
  // Subscribe to connection status changes
  useEffect(() => {
    const handleConnectionStatusChange = (status: any) => {
      setIsConnected(status.isConnected);
      
      if (status.isFailed && status.error) {
        setError(status.error.message || 'Connection failed');
      } else if (status.isConnected) {
        setError(null);
      }
    };
    
    const unsubscribe = ablyClientManager.onConnectionStatusChange(handleConnectionStatusChange);
    return unsubscribe;
  }, []);
  
  // Subscribe to default message type if onMessageReceived is provided
  useEffect(() => {
    if (!channel || !onMessageReceived) return;
    
    const handleMessage = (message: any) => {
      try {
        const chatMessage = message.data as ChatMessage;
        onMessageReceived(chatMessage);
      } catch (err) {
        console.error('Error processing received message:', err);
      }
    };
    
    channel.subscribe(messageType, handleMessage);
    
    return () => {
      channel.unsubscribe(messageType, handleMessage);
    };
  }, [channel, messageType, onMessageReceived]);
  
  // Publish message to channel
  const publishMessage = useCallback(async (eventName: string, data: any): Promise<boolean> => {
    if (!channel || !isConnected) {
      setError('Cannot publish message: channel not connected');
      return false;
    }
    
    try {
      await new Promise<void>((resolve, reject) => {
        try {
          channel.publish(eventName, data);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to publish message';
      setError(errorMsg);
      handleError(errorMsg, { showToast: false });
      return false;
    }
  }, [channel, isConnected, handleError]);
  
  // Subscribe to event
  const subscribeToEvent = useCallback((eventName: string, callback: (message: any) => void) => {
    if (!channel) {
      setError('Cannot subscribe: channel not initialized');
      return;
    }
    
    channel.subscribe(eventName, callback);
  }, [channel]);
  
  // Unsubscribe from event
  const unsubscribeFromEvent = useCallback((eventName: string, callback?: (message: any) => void) => {
    if (!channel) return;
    
    if (callback) {
      channel.unsubscribe(eventName, callback);
    } else {
      channel.unsubscribe(eventName);
    }
  }, [channel]);
  
  return {
    channel,
    isConnected,
    publishMessage,
    subscribeToEvent,
    unsubscribeFromEvent,
    error
  };
}; 