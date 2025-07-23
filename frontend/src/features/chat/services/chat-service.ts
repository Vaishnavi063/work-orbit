import { request } from '@/apis';
import type { 
  ChatMessage, 
  ChatRoom 
} from '@/types';

// Maximum number of retry attempts for API calls
const MAX_RETRIES = 3;
// Base delay for exponential backoff (in ms)
const BASE_RETRY_DELAY = 1000;

/**
 * Service for handling chat-related API communication
 */
export class ChatService {
  private authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  /**
   * Set or update the auth token
   */
  setAuthToken(authToken: string): void {
    this.authToken = authToken;
  }

  /**
   * Get all chat rooms for the current user
   */
  async getUserChatRooms(): Promise<ChatRoom[]> {
    try {
      const response = await this.executeWithRetry(() => 
        request({
          method: 'GET',
          url: '/api/chat/rooms/user',
          authToken: this.authToken,
        })
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get user chat rooms:', error);
      throw this.formatError(error, 'Failed to retrieve chat rooms');
    }
  }

  /**
   * Get active chat rooms for the current user
   */
  async getActiveChatRooms(): Promise<ChatRoom[]> {
    try {
      const response = await this.executeWithRetry(() => 
        request({
          method: 'GET',
          url: '/api/chat/rooms/active',
          authToken: this.authToken,
        })
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get active chat rooms:', error);
      throw this.formatError(error, 'Failed to retrieve active chat rooms');
    }
  }

  /**
   * Get chat history for a specific chat room with pagination
   */
  async getChatHistory(
    chatRoomId: number, 
    page: number = 0, 
    size: number = 50
  ): Promise<{
    content: ChatMessage[];
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
  }> {
    try {
      const response = await this.executeWithRetry(() => 
        request({
          method: 'GET',
          url: `/api/chat/rooms/${chatRoomId}/messages`,
          params: { page, size, sort: 'createdAt,desc' },
          authToken: this.authToken,
        })
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw this.formatError(error, 'Failed to retrieve chat history');
    }
  }

  /**
   * Send a message in a chat room
   */
  async sendMessage(chatRoomId: number, content: string): Promise<ChatMessage> {
    try {
      const response = await this.executeWithRetry(() => 
        request({
          method: 'POST',
          url: '/api/chat/send',
          data: { chatRoomId, content },
          authToken: this.authToken,
        })
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw this.formatError(error, 'Failed to send message');
    }
  }

  /**
   * Mark all messages in a chat room as read
   */
  async markAsRead(chatRoomId: number): Promise<void> {
    try {
      await this.executeWithRetry(() => 
        request({
          method: 'POST',
          url: `/api/chat/rooms/${chatRoomId}/read`,
          authToken: this.authToken,
        })
      );
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw this.formatError(error, 'Failed to mark messages as read');
    }
  }

  /**
   * Get bid details for a chat room
   */
  async getBidDetailsForChat(chatRoomId: number): Promise<any> {
    try {
      const response = await this.executeWithRetry(() => 
        request({
          method: 'GET',
          url: `/api/chat/rooms/${chatRoomId}/bid-details`,
          authToken: this.authToken,
        })
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get bid details:', error);
      throw this.formatError(error, 'Failed to retrieve bid details');
    }
  }

  /**
   * Get contract details for a chat room
   */
  async getContractDetailsForChat(chatRoomId: number): Promise<any> {
    try {
      const response = await this.executeWithRetry(() => 
        request({
          method: 'GET',
          url: `/api/chat/rooms/${chatRoomId}/contract-details`,
          authToken: this.authToken,
        })
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get contract details:', error);
      throw this.formatError(error, 'Failed to retrieve contract details');
    }
  }

  /**
   * Accept a bid through chat interface
   */
  async acceptBidInChat(bidId: number): Promise<void> {
    try {
      await this.executeWithRetry(() => 
        request({
          method: 'POST',
          url: `/api/chat/bid/${bidId}/accept`,
          authToken: this.authToken,
        })
      );
    } catch (error) {
      console.error('Failed to accept bid:', error);
      throw this.formatError(error, 'Failed to accept bid');
    }
  }

  /**
   * Reject a bid through chat interface
   */
  async rejectBidInChat(bidId: number): Promise<void> {
    try {
      await this.executeWithRetry(() => 
        request({
          method: 'POST',
          url: `/api/chat/bid/${bidId}/reject`,
          authToken: this.authToken,
        })
      );
    } catch (error) {
      console.error('Failed to reject bid:', error);
      throw this.formatError(error, 'Failed to reject bid');
    }
  }

  /**
   * Get new messages since a specific timestamp
   * @param chatRoomId The chat room ID
   * @param since Timestamp to get messages since
   */
  async getNewMessages(chatRoomId: number, since: Date): Promise<ChatMessage[]> {
    try {
      const response = await this.executeWithRetry(() => 
        request({
          method: 'GET',
          url: `/api/chat/rooms/${chatRoomId}/messages/since`,
          params: { since: since.toISOString() },
          authToken: this.authToken,
        })
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get new messages:', error);
      throw this.formatError(error, 'Failed to retrieve new messages');
    }
  }

  /**
   * Execute a request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>, 
    retries: number = MAX_RETRIES
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      // Don't retry if we've exhausted our retries or if it's a 4xx error (except 429)
      if (
        retries <= 0 || 
        (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429)
      ) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = BASE_RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      
      console.log(`Retrying request after ${delay}ms (${retries} retries left)`);
      
      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return this.executeWithRetry(requestFn, retries - 1);
    }
  }

  /**
   * Format error for consistent error handling
   */
  private formatError(error: any, defaultMessage: string): Error {
    let errorMessage = defaultMessage;
    
    if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    const formattedError = new Error(errorMessage);
    formattedError.name = 'ChatServiceError';
    
    // Attach original error data for debugging
    (formattedError as any).originalError = error;
    
    return formattedError;
  }
}

// Create a singleton instance factory
let chatServiceInstance: ChatService | null = null;

export const getChatService = (authToken: string): ChatService => {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService(authToken);
  } else if (authToken) {
    // Update token if provided
    chatServiceInstance.setAuthToken(authToken);
  }
  
  return chatServiceInstance;
};

export default ChatService;