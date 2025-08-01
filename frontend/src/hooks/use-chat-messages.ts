import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useChatService } from "./use-chat-service";
import { usePollingChat } from "./use-polling-chat";
import type { ChatMessage } from "@/types";

// Add a custom property to ChatMessage for status tracking
interface EnhancedChatMessage extends ChatMessage {
    status: "pending" | "delivered" | "error";
    clientId?: string; // For optimistic updates and matching responses
}

interface UseChatMessagesProps {
    chatRoomId?: number;
    chatType?: "BID_NEGOTIATION" | "CONTRACT";
    referenceId?: number;
}

interface UseChatMessagesReturn {
    messages: EnhancedChatMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (content: string) => Promise<void>;
    markAsRead: () => Promise<void>;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    retryMessage: (clientId: string) => Promise<void>;
}

/**
 * Hook for managing chat messages with polling and status tracking
 */
export const useChatMessages = ({
    chatRoomId,
}: UseChatMessagesProps = {}): UseChatMessagesReturn => {
    const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [hasInitiallyLoaded, setHasInitiallyLoaded] =
        useState<boolean>(false);

    const chatService = useChatService();
    const user = useSelector((state: RootState) => state.auth?.user);

    // Keep track of pending messages by clientId
    const pendingMessages = useRef<Map<string, EnhancedChatMessage>>(new Map());

    // Handle new messages from polling - optimized to prevent re-renders
    const handleNewMessages = useCallback((newMessages: ChatMessage[]) => {
        if (newMessages.length === 0) return;

        setMessages((prevMessages) => {
            const messageMap = new Map(
                prevMessages.map((msg) => [msg.id, msg])
            );
            const pendingMap = pendingMessages.current;
            let hasChanges = false;

            // Process each new message
            newMessages.forEach((newMsg) => {
                // Skip if message already exists
                if (messageMap.has(newMsg.id)) return;

                // Check for matching pending message
                const pendingMessage = Array.from(pendingMap.values()).find(
                    (msg) =>
                        msg.content === newMsg.content &&
                        msg.senderType === newMsg.senderType &&
                        Math.abs(
                            new Date(msg.createdAt).getTime() -
                                new Date(newMsg.createdAt).getTime()
                        ) < 30000
                );

                if (pendingMessage) {
                    // Update pending message to delivered
                    messageMap.set(newMsg.id, {
                        ...newMsg,
                        status: "delivered",
                        clientId: pendingMessage.clientId,
                    });
                    pendingMap.delete(pendingMessage.clientId!);
                } else {
                    // Add new message
                    messageMap.set(newMsg.id, {
                        ...newMsg,
                        status: "delivered",
                    });
                }
                hasChanges = true;
            });

            // Only update if there are actual changes
            if (!hasChanges) return prevMessages;

            // Convert back to array and sort
            return Array.from(messageMap.values()).sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
        });
    }, []);

    // Start polling for new messages
    const { error: pollingError, setActive } = usePollingChat({
        chatRoomId,
        isActive: true,
        onNewMessages: handleNewMessages,
    });

    // Update error state if polling fails
    useEffect(() => {
        if (pollingError) {
            setError(`Polling error: ${pollingError.message}`);
        }
    }, [pollingError]);

    // Load initial messages only when chatRoomId changes
    useEffect(() => {
        if (!chatRoomId) return;

        const loadInitialMessages = async () => {
            // Only show loading if we haven't loaded messages yet
            if (!hasInitiallyLoaded) {
                setIsLoading(true);
            }
            setError(null);

            try {
                const data = await chatService.getChatHistory(chatRoomId);

                // Convert messages to enhanced format
                const enhancedMessages: EnhancedChatMessage[] =
                    data.content.map((msg) => ({
                        ...msg,
                        status: "delivered",
                    }));

                setMessages(enhancedMessages);
                setHasMore(data.totalPages > 1);
                setPage(0);
                setHasInitiallyLoaded(true);

                // Mark messages as read
                await chatService.markAsRead(chatRoomId);
            } catch (err: any) {
                setError(err?.message || "Failed to load messages");
            } finally {
                setIsLoading(false);
            }
        };

        // Reset initial load flag when chat room changes
        setHasInitiallyLoaded(false);
        loadInitialMessages();
    }, [chatRoomId, chatService]);

    // Mark messages as read
    const markAsRead = useCallback(async () => {
        if (!chatRoomId) return;

        try {
            await chatService.markAsRead(chatRoomId);
        } catch (err: any) {
            console.error("Failed to mark messages as read:", err);
        }
    }, [chatRoomId, chatService]);

    // Send a message with optimistic update
    const sendMessage = useCallback(
        async (content: string) => {
            if (!chatRoomId || !content.trim() || !user) return;

            const senderType =
                user.role === "ROLE_CLIENT" ? "CLIENT" : "FREELANCER";
            const clientId = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 11)}`;

            // Create optimistic message
            const optimisticMessage: EnhancedChatMessage = {
                id: Date.now(), // Use positive timestamp ID
                chatRoomId: chatRoomId,
                senderType: senderType,
                senderId: user.id,
                senderName: user.name || "You",
                content: content,
                messageType: "TEXT",
                isRead: false,
                status: "pending",
                clientId: clientId,
                createdAt: new Date().toISOString(),
            };

            // Add to pending messages map
            pendingMessages.current.set(clientId, optimisticMessage);

            // Add to messages state (optimistic update)
            setMessages((prev) => [optimisticMessage, ...prev]);

            try {
                // Send the message
                const sentMessage = await chatService.sendMessage(
                    chatRoomId,
                    content
                );

                // Update the message status to delivered
                setMessages((prev) => {
                    return prev.map((msg) => {
                        if (msg.clientId === clientId) {
                            return {
                                ...sentMessage,
                                status: "delivered",
                                clientId: clientId,
                            };
                        }
                        return msg;
                    });
                });

                // Remove from pending messages
                pendingMessages.current.delete(clientId);
            } catch (err: any) {
                // Update the message status to error
                setMessages((prev) => {
                    return prev.map((msg) => {
                        if (msg.clientId === clientId) {
                            return {
                                ...msg,
                                status: "error",
                            };
                        }
                        return msg;
                    });
                });

                setError(err?.message || "Failed to send message");
            }
        },
        [chatRoomId, user, chatService]
    );

    // Retry sending a failed message
    const retryMessage = useCallback(
        async (clientId: string) => {
            const failedMessage = messages.find(
                (msg) => msg.clientId === clientId && msg.status === "error"
            );

            if (!failedMessage || !chatRoomId) return;

            // Update status to pending
            setMessages((prev) => {
                return prev.map((msg) => {
                    if (msg.clientId === clientId) {
                        return {
                            ...msg,
                            status: "pending",
                        };
                    }
                    return msg;
                });
            });

            try {
                // Retry sending the message
                const sentMessage = await chatService.sendMessage(
                    chatRoomId,
                    failedMessage.content
                );

                // Update the message status to delivered
                setMessages((prev) => {
                    return prev.map((msg) => {
                        if (msg.clientId === clientId) {
                            return {
                                ...sentMessage,
                                status: "delivered",
                                clientId: clientId,
                            };
                        }
                        return msg;
                    });
                });

                // Remove from pending messages if it's still there
                pendingMessages.current.delete(clientId);
            } catch (err: any) {
                // Update the message status to error
                setMessages((prev) => {
                    return prev.map((msg) => {
                        if (msg.clientId === clientId) {
                            return {
                                ...msg,
                                status: "error",
                            };
                        }
                        return msg;
                    });
                });

                setError(err?.message || "Failed to send message");
            }
        },
        [messages, chatRoomId, chatService]
    );

    // Load more messages (pagination)
    const loadMore = useCallback(async () => {
        if (!chatRoomId || !hasMore || isLoading) return;

        setIsLoading(true);

        try {
            const nextPage = page + 1;
            const data = await chatService.getChatHistory(chatRoomId, nextPage);

            // Convert messages to enhanced format
            const enhancedMessages: EnhancedChatMessage[] = data.content.map(
                (msg) => ({
                    ...msg,
                    status: "delivered",
                })
            );

            setMessages((prev) => [...prev, ...enhancedMessages]);
            setHasMore(nextPage < data.totalPages - 1);
            setPage(nextPage);
        } catch (err: any) {
            setError(err?.message || "Failed to load more messages");
        } finally {
            setIsLoading(false);
        }
    }, [chatRoomId, hasMore, isLoading, page, chatService]);

    // Update polling active state when component visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            setActive(!document.hidden);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [setActive]);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        markAsRead,
        hasMore,
        loadMore,
        retryMessage,
    };
};

export default useChatMessages;
