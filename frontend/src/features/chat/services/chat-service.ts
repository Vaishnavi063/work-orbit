import { chatApis } from '../apis';
import type { ChatMessage } from '@/types';
import { chatPollingService } from './chat-polling-service';

/**
 * Service for managing chat operations
 */
export class ChatService {
  private authToken: string;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second initial delay
  
  constructor(authToken: string) {
    this.authToken = authToken;
  }
  
  /**
   * Send a message in a chat room
   * Returns a message with a temporary ID immediately, then updates with the actual ID
   */
  public async sendMessage(chatRoomId: number, content: string): Promise<ChatMessage> {
    // Create a temporary message with pending status
    const tempMessage: ChatMessage = {
      id: Date.now(), // Temporary ID
      chatRoomId,
      senderType: 'FREELANCER', // Will be overridden by backend
      senderName: '', // Will be filled by backend
      content,
      messageType: 'TEXT',
      isRead: false,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    try {
      const response = await this.executeWithRetry(() => 
        chatApis.sendMessage({
          chatRoomId,
          content,
          authToken: this.authToken,
        })
      );
      
      // Return the actual message with delivered status
      const actualMessage = response.data.data;
      return {
        ...actualMessage,
        status: 'delivered'
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      // Return the temporary message with error status
      return {
        ...tempMessage,
        status: 'error'
      };
    }
  }
  
  /**
   * Get new messages since a specific timestamp
   */
  public async getNewMessages(chatRoomId: number, since: string): Promise<ChatMessage[]> {
    try {
      const response = await this.executeWithRetry(() => 
        chatApis.getNewMessages({
          chatRoomId,
          since,
          authToken: this.authToken,
        })
      );
      
      // Mark messages as delivered
      const messages = response.data.data || [];
      return messages.map((message: ChatMessage) => ({
        ...message,
        status: 'delivered'
      }));
    } catch (error) {
      console.error('Failed to get new messages:', error);
      throw error;
    }
  }
  
  /**
   * Start polling for new messages
   */
  public startPolling(
    chatRoomId: number, 
    onNewMessages: (messages: ChatMessage[]) => void,
    onError?: (error: Error) => void,
    isActive: boolean = true
  ): void {
    chatPollingService.startPolling({
      chatRoomId,
      authToken: this.authToken,
      onNewMessages,
      onError,
      isActive,
    });
  }
  
  /**
   * Stop polling for new messages
   */
  public stopPolling(chatRoomId: number): void {
    chatPollingService.stopPolling(chatRoomId);
  }
  
  /**
   * Update polling frequency based on active state
   */
  public updatePollingFrequency(
    chatRoomId: number, 
    isActive: boolean,
    onNewMessages: (messages: ChatMessage[]) => void,
    onError?: (error: Error) => void
  ): void {
    chatPollingService.updatePollingFrequency(
      chatRoomId,
      isActive,
      this.authToken,
      onNewMessages,
      onError
    );
  }
  
  /**
   * Clean up all polling intervals and timeouts
   */
  public cleanupPolling(): void {
    chatPollingService.cleanupAll();
  }
  
  /**
   * Mark all messages in a chat room as read
   */
  public async markAsRead(chatRoomId: number): Promise<void> {
    try {
      await this.executeWithRetry(() => 
        chatApis.markAsRead({
          chatRoomId,
          authToken: this.authToken,
        })
      );
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  }
  
  /**
   * Get chat history for a specific chat room
   */
  public async getChatHistory(
    chatRoomId: number, 
    page: number = 0, 
    size: number = 20
  ): Promise<{
    content: ChatMessage[];
    totalPages: number;
    totalElements: number;
  }> {
    try {
      const response = await this.executeWithRetry(() => 
        chatApis.getChatHistory({
          chatRoomId,
          page,
          size,
          authToken: this.authToken,
        })
      );
      
      // Mark all messages as delivered
      const result = response.data.data;
      return {
        ...result,
        content: result.content.map((message: ChatMessage) => ({
          ...message,
          status: 'delivered'
        }))
      };
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw error;
    }
  }
  
  /**
   * Execute a function with retry logic
   * @param fn Function to execute
   * @returns Promise with the result of the function
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let retries = 0;
    let lastError: any;
    
    while (retries < this.maxRetries) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Check if we should retry based on error type
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Authentication error - don't retry
          throw error;
        }
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        retries++;
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw lastError;
  }
}

// Cache of ChatService instances by auth token
const chatServiceInstances = new Map<string, ChatService>();

/**
 * Get or create a ChatService instance for the given auth token
 * This ensures we reuse the same instance for the same auth token
 */
export const getChatService = (authToken: string): ChatService => {
  if (!chatServiceInstances.has(authToken)) {
    chatServiceInstances.set(authToken, new ChatService(authToken));
  }
  
  return chatServiceInstances.get(authToken)!;
};

/**
 * Clear the chat service instance for a specific auth token
 * Useful when logging out or when the token is invalidated
 */
export const clearChatService = (authToken: string): void => {
  const service = chatServiceInstances.get(authToken);
  if (service) {
    service.cleanupPolling();
    chatServiceInstances.delete(authToken);
  }
};

/**
 * Clear all chat service instances
 * Useful when logging out or when the application is unloaded
 */
export const clearAllChatServices = (): void => {
  chatServiceInstances.forEach(service => {
    service.cleanupPolling();
  });
  chatServiceInstances.clear();
};