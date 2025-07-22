import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ablyClientManager, type AblyConnectionStatus } from '@/lib/ably-client';
import type { RootState } from '@/store';

export interface UseAblyConnectionReturn {
  connectionStatus: AblyConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isFailed: boolean;
  error?: string;
  reconnect: () => void;
  disconnect: () => Promise<void>;
}

/**
 * Hook for managing Ably connection lifecycle
 */
export const useAblyConnection = (): UseAblyConnectionReturn => {
  const [connectionStatus, setConnectionStatus] = useState<AblyConnectionStatus>({
    state: 'initialized',
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
    isFailed: false,
  });

  // Get auth token from Redux store
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuth);

  /**
   * Initialize Ably connection when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated && authToken) {
      const initializeConnection = async () => {
        try {
          await ablyClientManager.initialize(authToken);
        } catch (error) {
          console.error('Failed to initialize Ably connection:', error);
        }
      };

      initializeConnection();
    }
  }, [isAuthenticated, authToken]);

  /**
   * Subscribe to connection status changes
   */
  useEffect(() => {
    const unsubscribe = ablyClientManager.onConnectionStatusChange(setConnectionStatus);
    return unsubscribe;
  }, []);

  /**
   * Cleanup connection when component unmounts or user logs out
   */
  useEffect(() => {
    return () => {
      if (!isAuthenticated) {
        ablyClientManager.disconnect();
      }
    };
  }, [isAuthenticated]);

  /**
   * Manual reconnection
   */
  const reconnect = useCallback(() => {
    ablyClientManager.reconnect();
  }, []);

  /**
   * Manual disconnection
   */
  const disconnect = useCallback(async () => {
    await ablyClientManager.disconnect();
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus.isConnected,
    isConnecting: connectionStatus.isConnecting,
    isDisconnected: connectionStatus.isDisconnected,
    isFailed: connectionStatus.isFailed,
    error: connectionStatus.error?.message,
    reconnect,
    disconnect,
  };
};