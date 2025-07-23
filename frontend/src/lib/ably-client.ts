import * as Ably from 'ably';
import { request } from '@/apis';

export interface AblyTokenResponse {
  token: string;
  expires: number;
  clientId: string;
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
  private tokenRefreshPromise: Promise<AblyTokenResponse> | null = null;
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
      // First get a token to get the clientId
      const tokenResponse = await this.refreshAblyToken(authToken);
      
      this.client = new Ably.Realtime({
        authCallback: async (_tokenParams, callback) => {
          try {
            const tokenData = await this.refreshAblyToken(authToken);
            callback(null, tokenData.token);
          } catch (error) {
            callback(error as Ably.ErrorInfo, null);
          }
        },
        clientId: tokenResponse.clientId,
        autoConnect: true,
        disconnectedRetryTimeout: 5000,
        suspendedRetryTimeout: 10000,
      });

      this.setupConnectionListeners();
      this.isInitialized = true;
    } catch (error) {
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
  private async refreshAblyToken(authToken: string): Promise<AblyTokenResponse> {
    // Prevent multiple simultaneous token refresh requests
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this.performTokenRefresh(authToken);
    
    try {
      const tokenData = await this.tokenRefreshPromise;
      return tokenData;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh request
   */
  private async performTokenRefresh(authToken: string): Promise<AblyTokenResponse> {
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
      return tokenData;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          throw new Error('Authentication failed. JWT token may be invalid or expired.');
        }
      } 
      
      throw new Error(`Failed to authenticate with real-time service: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Setup connection event listeners
   */
  private setupConnectionListeners(): void {
    if (!this.client) return;

    this.client.connection.on('connected', () => {
      this.notifyConnectionStatus();
    });

    this.client.connection.on('connecting', () => {
      this.notifyConnectionStatus();
    });

    this.client.connection.on('disconnected', () => {
      this.notifyConnectionStatus();
    });

    this.client.connection.on('suspended', () => {
      this.notifyConnectionStatus();
    });

    this.client.connection.on('failed', () => {
      this.notifyConnectionStatus();
    });

    this.client.connection.on('closed', () => {
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
        // Silent error handling
      }
    });
  }

  /**
   * Get a channel instance
   */
  getChannel(channelName: string): Ably.RealtimeChannel | null {
    if (!this.client) {
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

/**
 * Channel naming utilities that match backend AblyService
 */
export const AblyChannelUtils = {
  /**
   * Creates a standardized channel name for different chat types.
   * This matches the backend AblyService.createChannelName() method.
   */
  createChannelName(chatType: 'BID_NEGOTIATION' | 'CONTRACT', referenceId: number): string {
    switch (chatType) {
      case 'BID_NEGOTIATION':
        return `bid-chat:${referenceId}`;
      case 'CONTRACT':
        return `contract-chat:${referenceId}`;
      default:
        throw new Error(`Unknown chat type: ${chatType}`);
    }
  },

  /**
   * Creates a typing indicator channel name for the given chat channel.
   * This matches the backend AblyService.createTypingChannelName() method.
   */
  createTypingChannelName(baseChannelName: string): string {
    return `${baseChannelName}:typing`;
  },

  /**
   * Creates a typing indicator channel name directly from chat room data.
   */
  createTypingChannelNameFromChatRoom(chatType: 'BID_NEGOTIATION' | 'CONTRACT', referenceId: number): string {
    const baseChannel = this.createChannelName(chatType, referenceId);
    return this.createTypingChannelName(baseChannel);
  }
};

// Export types and utilities
export type { Ably };
export default ablyClientManager;