import { chatApis } from "../apis";
import type { ChatMessage } from "@/types";

// Configuration constants
const ACTIVE_POLLING_INTERVAL = 3000; // 3 seconds when active
const INACTIVE_POLLING_INTERVAL = 15000; // 15 seconds when inactive
const BACKGROUND_POLLING_INTERVAL = 30000; // 30 seconds when tab is hidden
const MAX_RETRY_COUNT = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

interface PollingOptions {
    chatRoomId: number;
    authToken: string;
    onNewMessages: (messages: ChatMessage[]) => void;
    onError?: (error: Error) => void;
    isActive?: boolean;
}

/**
 * Service for managing chat message polling
 */
export class ChatPollingService {
    private pollingIntervals: Map<number, NodeJS.Timeout> = new Map();
    private lastMessageTimestamps: Map<number, string> = new Map();
    private retryCount: Map<number, number> = new Map();
    private retryTimeouts: Map<number, NodeJS.Timeout> = new Map();

    /**
     * Start polling for new messages for a specific chat room
     */
    public startPolling({
        chatRoomId,
        authToken,
        onNewMessages,
        onError,
        isActive = true,
    }: PollingOptions): void {
        // Stop any existing polling for this chat room
        this.stopPolling(chatRoomId);

        // Reset retry count
        this.retryCount.set(chatRoomId, 0);

        // Set initial polling interval based on active state and visibility
        const getInterval = () => {
            if (document.hidden) return BACKGROUND_POLLING_INTERVAL;
            return isActive
                ? ACTIVE_POLLING_INTERVAL
                : INACTIVE_POLLING_INTERVAL;
        };

        let lastPollTime = Date.now();

        let isPolling = true;
        let consecutiveEmptyPolls = 0;
        const MAX_EMPTY_POLLS = 3;

        // Start polling with adaptive interval
        const poll = async () => {
            if (!isPolling || !this.pollingIntervals.has(chatRoomId)) return;

            try {
                // Enforce minimum interval to prevent spam
                const now = Date.now();
                const minInterval = getInterval();
                const timeSinceLastPoll = now - lastPollTime;

                if (timeSinceLastPoll < minInterval) {
                    setTimeout(poll, minInterval - timeSinceLastPoll);
                    return;
                }

                lastPollTime = now;

                // Get the last message timestamp or use 5 minutes ago
                const since =
                    this.lastMessageTimestamps.get(chatRoomId) ||
                    new Date(Date.now() - 300000).toISOString();

                // Poll for new messages
                const messages = await this.pollForMessages(
                    chatRoomId,
                    since,
                    authToken
                );

                if (messages.length > 0) {
                    // Reset empty poll counter
                    consecutiveEmptyPolls = 0;

                    // Update the last message timestamp to the most recent message
                    const latestMessage = messages.reduce((latest, message) => {
                        return new Date(message.createdAt) >
                            new Date(latest.createdAt)
                            ? message
                            : latest;
                    }, messages[0]);

                    this.lastMessageTimestamps.set(
                        chatRoomId,
                        latestMessage.createdAt
                    );

                    // Call the callback with the new messages
                    onNewMessages(messages);

                    // Reset retry count on successful poll with messages
                    this.retryCount.set(chatRoomId, 0);
                } else {
                    // Increment empty poll counter
                    consecutiveEmptyPolls++;
                }

                // Increase interval if too many empty polls
                const nextInterval =
                    consecutiveEmptyPolls >= MAX_EMPTY_POLLS
                        ? getInterval() * 2
                        : getInterval();

                // Schedule next poll only if still active
                if (isPolling && this.pollingIntervals.has(chatRoomId)) {
                    setTimeout(poll, nextInterval);
                }
            } catch (error) {
                // Handle error with exponential backoff
                this.handlePollingError(
                    chatRoomId,
                    authToken,
                    onNewMessages,
                    onError,
                    isActive,
                    error as Error
                );
            }
        };

        // Start initial poll after a short delay
        setTimeout(poll, 2000);

        // Store polling state
        this.pollingIntervals.set(
            chatRoomId,
            setTimeout(() => {}, 0)
        );
    }

    /**
     * Stop polling for a specific chat room
     */
    public stopPolling(chatRoomId: number): void {
        // Clear any existing polling interval
        if (this.pollingIntervals.has(chatRoomId)) {
            clearInterval(this.pollingIntervals.get(chatRoomId));
            this.pollingIntervals.delete(chatRoomId);
        }

        // Clear any existing retry timeout
        if (this.retryTimeouts.has(chatRoomId)) {
            clearTimeout(this.retryTimeouts.get(chatRoomId));
            this.retryTimeouts.delete(chatRoomId);
        }
    }

    /**
     * Update polling frequency based on active state
     */
    public updatePollingFrequency(
        chatRoomId: number,
        isActive: boolean,
        authToken: string,
        onNewMessages: (messages: ChatMessage[]) => void,
        onError?: (error: Error) => void
    ): void {
        // If we're already polling, update the frequency
        if (this.pollingIntervals.has(chatRoomId)) {
            this.stopPolling(chatRoomId);
            this.startPolling({
                chatRoomId,
                authToken,
                onNewMessages,
                onError,
                isActive,
            });
        }
    }

    /**
     * Handle polling errors with exponential backoff
     */
    private handlePollingError(
        chatRoomId: number,
        authToken: string,
        onNewMessages: (messages: ChatMessage[]) => void,
        onError?: (error: Error) => void,
        isActive: boolean = true,
        error?: Error
    ): void {
        // Call the error callback if provided
        if (onError && error) {
            onError(error);
        }

        // Get the current retry count or initialize to 0
        const currentRetryCount = this.retryCount.get(chatRoomId) || 0;

        // If we've reached the maximum retry count, stop retrying
        if (currentRetryCount >= MAX_RETRY_COUNT) {
            // Stop polling
            this.stopPolling(chatRoomId);
            return;
        }

        // Increment the retry count
        this.retryCount.set(chatRoomId, currentRetryCount + 1);

        // Calculate the retry delay with exponential backoff
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, currentRetryCount);

        // Clear any existing retry timeout
        if (this.retryTimeouts.has(chatRoomId)) {
            clearTimeout(this.retryTimeouts.get(chatRoomId));
        }

        // Set a timeout to retry
        const timeoutId = setTimeout(() => {
            // Restart polling
            this.stopPolling(chatRoomId);
            this.startPolling({
                chatRoomId,
                authToken,
                onNewMessages,
                onError,
                isActive,
            });
        }, retryDelay);

        // Store the timeout ID for later cleanup
        this.retryTimeouts.set(chatRoomId, timeoutId);
    }

    /**
     * Poll for new messages since a specific timestamp
     */
    private async pollForMessages(
        chatRoomId: number,
        since: string,
        authToken: string
    ): Promise<ChatMessage[]> {
        // Call the API to get new messages
        const response = await chatApis.getNewMessages({
            chatRoomId,
            since,
            authToken,
        });

        // Return the messages
        return response.data.data || [];
    }

    /**
     * Clean up all polling intervals and timeouts
     */
    public cleanupAll(): void {
        // Clear all polling intervals
        this.pollingIntervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.pollingIntervals.clear();

        // Clear all retry timeouts
        this.retryTimeouts.forEach((timeout) => {
            clearTimeout(timeout);
        });
        this.retryTimeouts.clear();

        // Clear all other state
        this.lastMessageTimestamps.clear();
        this.retryCount.clear();
    }
}

// Create a singleton instance
export const chatPollingService = new ChatPollingService();
