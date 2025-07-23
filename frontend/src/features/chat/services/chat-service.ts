import { chatApis } from '../apis';
import type { ChatMessage } from '@/types';
import { chatPollingService } from './chat-polling-service';

/**
 * Service for managing chat operations
 */
export class ChatService {
  private authToken: string;
  
  constructor(authToken: string) {
    this.authToken = authToken;
  }
  
  /**
   * Send a message in a chat room
   */
  public async sendMessage(chatRoomId: number, content: string): Promise<ChatMessage> {
    try {
      const response = await chatApis.sendMessage({
        chatRoomId,
        content,
        authToken: this.authToken,
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }
  
  /**
   * Get new messages since a specific timestamp
   */
  public async getNewMessages(chatRoomId: number, since: string): Promise<ChatMessage[]> {
    try {
      const response = await chatApis.getNewMessages({
        chatRoomId,
        since,
        authToken: this.authToken,
      });
      
      return response.data.data || [];
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
      await chatApis.markAsRead({
        chatRoomId,
        authToken: this.authToken,
      });
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
      const response = await chatApis.getChatHistory({
        chatRoomId,
        page,
        size,
        authToken: this.authToken,
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw error;
    }
  }
}

// Cache of ChatService instances by auth token
const chatServiceInstances = new Map<string, ChatService>();

/**
 * Get or create a ChatService instance for the given auth token
 */
export const getChatService = (authToken: string): ChatService => {
  if (!chatServiceInstances.has(authToken)) {
    chatServiceInstances.set(authToken, new ChatService(authToken));
  }
  
  return chatServiceInstances.get(authToken)!;
};