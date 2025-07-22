import * as Ably from 'ably';
import { request } from '@/apis';

export interface AblyTokenResponse {
  token: string;
  expires: number;
}

export interface AblyConnectionStatus {
  state: Ably.ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isFailed: boolean;
  error?: Ably.ErrorInfo;
}

class AblyClientManager {
  private client: Ably.Realtime | null = null;
  private tokenRefreshPromise: Promise<string> | null = null;
  private connectionStatusCallbacks: Set<(status: AblyConnectionStatus) => void> = new Set();
  private isInitialized = false;

  /**
   * Initialize the Ably client with token authentication
   */
  async initialize(authToken: string): Promise<void> {
    if (this.isInitialized && this.client) {
      return;
    }

    try {
      this.client = new Ably.Realtime({
        authCallback: async (_tokenParams, callback) => {
          try {
            const token = await this.refreshAblyToken(authToken);
            callback(null, token);
          } catch (error) {
            callback(error as Ably.ErrorInfo, null);
          }
        },
        autoConnect: true,
        disconnectedRetryTimeout: 5000,
        suspendedRetryTimeout: 10000,
      });

      this.setupConnectionListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Ably client:', error);
      throw error;
    }
  }

  /**
   * Get the Ably client instance
   */
  getClient(): Ably.Realtime | null {
    return this.client;
  }

  /**
   * Refresh Ably token from backend
   */
  private async refreshAblyToken(authToken: string): Promise<string> {
    // Prevent multiple simultaneous token refresh requests
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this.performTokenRefresh(authToken);
    
    try {
      const token = await this.tokenRefreshPromise;
      return token;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh request
   */
  private async performTokenRefresh(authToken: string): Promise<string> {
    try {
      const response = await request({
        method: 'POST',
        url: '/api/chat/ably-token',
        authToken,
        data: {
          channels: ['*'], // Request access to all channels, backend will filter
        },
      });

      const tokenData: AblyTokenResponse = response.data.data;
      return tokenData.token;
    } catch (error) {
      console.error('Failed to refresh Ably token:', error);
      throw new Error('Failed to authenticate with real-time service');
    }
  }

  /**
   * Setup connection event listeners
   */
  private setupConnectionListeners(): void {
    if (!this.client) return;

    this.client.connection.on('connected', () => {
      console.log('Ably client connected');
      this.notifyConnectionStatus();
    });

    this.client.connection.on('connecting', () => {
      console.log('Ably client connecting...');
      this.notifyConnectionStatus();
    });

    this.client.connection.on('disconnected', () => {
      console.log('Ably client disconnected');
      this.notifyConnectionStatus();
    });

    this.client.connection.on('suspended', () => {
      console.log('Ably client connection suspended');
      this.notifyConnectionStatus();
    });

    this.client.connection.on('failed', (error) => {
      console.error('Ably client connection failed:', error);
      this.notifyConnectionStatus();
    });

    this.client.connection.on('closed', () => {
      console.log('Ably client connection closed');
      this.notifyConnectionStatus();
    });
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): AblyConnectionStatus {
    if (!this.client) {
      return {
        state: 'initialized',
        isConnected: false,
        isConnecting: false,
        isDisconnected: true,
        isFailed: false,
      };
    }

    const state = this.client.connection.state;
    return {
      state,
      isConnected: state === 'connected',
      isConnecting: state === 'connecting',
      isDisconnected: state === 'disconnected' || state === 'closed',
      isFailed: state === 'failed',
      error: this.client.connection.errorReason,
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatusChange(callback: (status: AblyConnectionStatus) => void): () => void {
    this.connectionStatusCallbacks.add(callback);
    
    // Immediately call with current status
    callback(this.getConnectionStatus());
    
    // Return unsubscribe function
    return () => {
      this.connectionStatusCallbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers of connection status changes
   */
  private notifyConnectionStatus(): void {
    const status = this.getConnectionStatus();
    this.connectionStatusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in connection status callback:', error);
      }
    });
  }

  /**
   * Get a channel instance
   */
  getChannel(channelName: string): Ably.RealtimeChannel | null {
    if (!this.client) {
      console.warn('Ably client not initialized');
      return null;
    }
    return this.client.channels.get(channelName);
  }

  /**
   * Manually reconnect the client
   */
  reconnect(): void {
    if (this.client) {
      this.client.connect();
    }
  }

  /**
   * Close the connection and cleanup
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.close();
      this.client = null;
      this.isInitialized = false;
      this.connectionStatusCallbacks.clear();
    }
  }

  /**
   * Check if client is ready for use
   */
  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }
}

// Export singleton instance
export const ablyClientManager = new AblyClientManager();

// Export types and utilities
export type { Ably };
export default ablyClientManager;