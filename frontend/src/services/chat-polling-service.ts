import type { AppDispatch } from '@/store';
import { fetchUserChatRooms, fetchActiveChatRooms } from '@/store/slices/chat-slice';

export interface ChatPollingConfig {
  visibleInterval: number;
  hiddenInterval: number;
  fetchType: 'all' | 'active';
}

export interface ChatPollingSubscriber {
  id: string;
  config: ChatPollingConfig;
  onUpdate?: (data: any) => void;
  onError?: (error: string) => void;
}

interface ErrorHandlingConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Singleton service for managing centralized chat polling across components
 * Eliminates duplicate API requests and provides subscription-based architecture
 */
export class ChatPollingService {
  private static instance: ChatPollingService;
  private subscribers: Map<string, ChatPollingSubscriber> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private currentConfig: ChatPollingConfig;
  private isPolling: boolean = false;
  private authToken: string | null = null;
  private dispatch: AppDispatch | null = null;
  private lastFetchTime: Date | null = null;
  private error: string | null = null;
  private retryCount: number = 0;
  private isVisible: boolean = true;
  
  // Error handling configuration
  private errorConfig: ErrorHandlingConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2
  };

  // Default configuration
  private defaultConfig: ChatPollingConfig = {
    visibleInterval: 10000,   // 10 seconds when visible
    hiddenInterval: 30000,    // 30 seconds when hidden
    fetchType: 'all'          // Fetch all chats by default
  };

  private constructor() {
    this.currentConfig = { ...this.defaultConfig };
    this.setupVisibilityHandler();
  }

  /**
   * Get singleton instance of ChatPollingService
   */
  public static getInstance(): ChatPollingService {
    if (!ChatPollingService.instance) {
      ChatPollingService.instance = new ChatPollingService();
    }
    return ChatPollingService.instance;
  }

  /**
   * Subscribe a component to chat updates
   */
  public subscribe(subscriber: ChatPollingSubscriber): void {
    this.subscribers.set(subscriber.id, subscriber);
    
    // Update polling configuration based on all subscribers
    this.updatePollingConfig();
    
    // Start polling if not already started and we have auth token
    if (!this.isPolling && this.authToken && this.dispatch) {
      this.startPolling();
    }
    
    console.log(`ChatPollingService: Subscriber ${subscriber.id} added. Total subscribers: ${this.subscribers.size}`);
  }

  /**
   * Unsubscribe a component from chat updates
   */
  public unsubscribe(subscriberId: string): void {
    const wasSubscribed = this.subscribers.has(subscriberId);
    this.subscribers.delete(subscriberId);
    
    if (wasSubscribed) {
      console.log(`ChatPollingService: Subscriber ${subscriberId} removed. Total subscribers: ${this.subscribers.size}`);
      
      // Update polling configuration
      this.updatePollingConfig();
      
      // Stop polling if no subscribers remain
      if (this.subscribers.size === 0) {
        this.stopPolling();
      }
    }
  }

  /**
   * Update authentication token and restart polling if needed
   */
  public updateAuthToken(token: string | null): void {
    const tokenChanged = this.authToken !== token;
    this.authToken = token;
    
    if (tokenChanged) {
      if (token && this.dispatch && this.subscribers.size > 0) {
        // Restart polling with new token
        this.stopPolling();
        this.startPolling();
      } else if (!token) {
        // Stop polling if token is removed
        this.stopPolling();
      }
    }
  }

  /**
   * Set Redux dispatch function
   */
  public setDispatch(dispatch: AppDispatch): void {
    this.dispatch = dispatch;
    
    // Start polling if we have subscribers and auth token
    if (!this.isPolling && this.authToken && this.subscribers.size > 0) {
      this.startPolling();
    }
  }

  /**
   * Get current polling status
   */
  public getStatus() {
    return {
      isPolling: this.isPolling,
      subscriberCount: this.subscribers.size,
      lastFetchTime: this.lastFetchTime,
      error: this.error,
      currentConfig: { ...this.currentConfig }
    };
  }

  /**
   * Start polling for chat data
   */
  private startPolling(): void {
    if (this.isPolling || !this.authToken || !this.dispatch) {
      return;
    }

    this.isPolling = true;
    this.error = null;
    this.retryCount = 0;
    
    // Initial fetch
    this.fetchChatData();
    
    // Set up polling interval
    const interval = this.isVisible ? this.currentConfig.visibleInterval : this.currentConfig.hiddenInterval;
    this.intervalId = setInterval(() => {
      this.fetchChatData();
    }, interval);
    
    console.log(`ChatPollingService: Started polling with ${interval}ms interval (${this.isVisible ? 'visible' : 'hidden'})`);
  }

  /**
   * Stop polling for chat data
   */
  private stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isPolling = false;
    this.retryCount = 0;
    
    console.log('ChatPollingService: Stopped polling');
  }

  /**
   * Restart polling with updated configuration
   */
  private restartPolling(): void {
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
  }

  /**
   * Handle document visibility changes for adaptive polling frequency
   */
  private setupVisibilityHandler(): void {
    const handleVisibilityChange = () => {
      const wasVisible = this.isVisible;
      this.isVisible = !document.hidden;
      
      if (wasVisible !== this.isVisible && this.isPolling) {
        console.log(`ChatPollingService: Visibility changed to ${this.isVisible ? 'visible' : 'hidden'}`);
        this.restartPolling();
      }
    };

    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle page unload to cleanup resources
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * Fetch chat data from API with error handling and retry logic
   */
  private async fetchChatData(): Promise<void> {
    if (!this.authToken || !this.dispatch) {
      return;
    }

    try {
      // Determine which action to dispatch based on current config
      const actionCreator = this.currentConfig.fetchType === 'active' 
        ? fetchActiveChatRooms
        : fetchUserChatRooms;

      const result = await this.dispatch(actionCreator({ authToken: this.authToken }));
      
      // Check if the action was fulfilled
      if (actionCreator.fulfilled.match(result)) {
        this.lastFetchTime = new Date();
        this.error = null;
        this.retryCount = 0;
        
        // Notify subscribers of successful update
        this.notifySubscribers(result.payload, null);
      } else if (actionCreator.rejected.match(result)) {
        throw new Error(result.payload as string || 'Failed to fetch chat data');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('ChatPollingService: Fetch error:', errorMessage);
      
      this.error = errorMessage;
      
      // Notify subscribers of error
      this.notifySubscribers(null, errorMessage);
      
      // Handle retry logic with exponential backoff
      await this.handleFetchError();
    }
  }

  /**
   * Handle fetch errors with exponential backoff retry logic
   */
  private async handleFetchError(): Promise<void> {
    this.retryCount++;
    
    if (this.retryCount >= this.errorConfig.maxRetries) {
      console.error(`ChatPollingService: Max retries (${this.errorConfig.maxRetries}) reached. Stopping polling.`);
      this.stopPolling();
      return;
    }
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.errorConfig.baseDelay * Math.pow(this.errorConfig.backoffMultiplier, this.retryCount - 1),
      this.errorConfig.maxDelay
    );
    
    console.log(`ChatPollingService: Retrying in ${delay}ms (attempt ${this.retryCount}/${this.errorConfig.maxRetries})`);
    
    // Wait before retrying
    setTimeout(() => {
      if (this.isPolling) {
        this.fetchChatData();
      }
    }, delay);
  }

  /**
   * Notify all subscribers of updates or errors
   */
  private notifySubscribers(data: any, error: string | null): void {
    this.subscribers.forEach((subscriber) => {
      try {
        if (error && subscriber.onError) {
          subscriber.onError(error);
        } else if (data && subscriber.onUpdate) {
          subscriber.onUpdate(data);
        }
      } catch (callbackError) {
        console.error(`ChatPollingService: Error in subscriber ${subscriber.id} callback:`, callbackError);
      }
    });
  }

  /**
   * Update polling configuration based on all subscribers
   */
  private updatePollingConfig(): void {
    if (this.subscribers.size === 0) {
      this.currentConfig = { ...this.defaultConfig };
      return;
    }

    // Find the most frequent polling requirements
    let minVisibleInterval = this.defaultConfig.visibleInterval;
    let minHiddenInterval = this.defaultConfig.hiddenInterval;
    let hasActiveFetchType = false;
    
    this.subscribers.forEach((subscriber) => {
      minVisibleInterval = Math.min(minVisibleInterval, subscriber.config.visibleInterval);
      minHiddenInterval = Math.min(minHiddenInterval, subscriber.config.hiddenInterval);
      
      if (subscriber.config.fetchType === 'active') {
        hasActiveFetchType = true;
      }
    });

    const newConfig: ChatPollingConfig = {
      visibleInterval: minVisibleInterval,
      hiddenInterval: minHiddenInterval,
      fetchType: hasActiveFetchType ? 'active' : 'all'
    };

    // Check if configuration changed
    const configChanged = 
      this.currentConfig.visibleInterval !== newConfig.visibleInterval ||
      this.currentConfig.hiddenInterval !== newConfig.hiddenInterval ||
      this.currentConfig.fetchType !== newConfig.fetchType;

    if (configChanged) {
      this.currentConfig = newConfig;
      console.log('ChatPollingService: Configuration updated:', newConfig);
      
      // Restart polling with new configuration
      if (this.isPolling) {
        this.restartPolling();
      }
    }
  }

  /**
   * Cleanup resources and stop polling
   */
  private cleanup(): void {
    this.stopPolling();
    this.subscribers.clear();
    this.authToken = null;
    this.dispatch = null;
    console.log('ChatPollingService: Cleaned up resources');
  }
}

// Export singleton instance getter for convenience
export const getChatPollingService = () => ChatPollingService.getInstance();