import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getChatPollingService } from "@/services/chat-polling-service";
import type { ChatPollingConfig } from "@/services/chat-polling-service";
import type { RootState, AppDispatch } from "@/store";

export interface UseChatPollingOptions {
    fetchType?: "all" | "active";
    visibleInterval?: number;
    hiddenInterval?: number;
    enabled?: boolean;
}

export interface UseChatPollingReturn {
    isPolling: boolean;
    error: string | null;
    lastUpdate: Date | null;
}

/**
 * React hook for subscribing to centralized chat polling service
 * Provides automatic subscription/unsubscription and error handling
 */
export const useChatPolling = (
    options: UseChatPollingOptions = {}
): UseChatPollingReturn => {
    const {
        fetchType = "all",
        visibleInterval = 10000,
        hiddenInterval = 30000,
        enabled = true,
    } = options;

    const dispatch = useDispatch<AppDispatch>();
    const { authToken } = useSelector((state: RootState) => state.auth);

    // State for tracking polling status and errors
    const [isPolling, setIsPolling] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // Refs to maintain stable references and avoid dependency issues
    const subscriberIdRef = useRef<string | null>(null);
    const pollingServiceRef = useRef(getChatPollingService());
    const enabledRef = useRef<boolean>(enabled);

    // Update enabled ref when prop changes
    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    // Generate unique subscriber ID
    const generateSubscriberId = useCallback(() => {
        return `useChatPolling-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    }, []);

    // Handle successful data updates
    const handleUpdate = useCallback((_data: any) => {
        setLastUpdate(new Date());
        setError(null);
    }, []);

    // Handle polling errors
    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage);
        console.error("useChatPolling: Error received:", errorMessage);
    }, []);

    // Subscribe to polling service
    const subscribe = useCallback(() => {
        if (!enabledRef.current || !authToken || subscriberIdRef.current) {
            return;
        }

        const subscriberId = generateSubscriberId();
        subscriberIdRef.current = subscriberId;

        const config: ChatPollingConfig = {
            visibleInterval,
            hiddenInterval,
            fetchType,
        };

        const subscriber = {
            id: subscriberId,
            config,
            onUpdate: handleUpdate,
            onError: handleError,
        };

        pollingServiceRef.current.subscribe(subscriber);

        // Update service with current auth token and dispatch
        pollingServiceRef.current.updateAuthToken(authToken);
        pollingServiceRef.current.setDispatch(dispatch);

        console.log(`useChatPolling: Subscribed with ID ${subscriberId}`);
    }, [
        authToken,
        dispatch,
        fetchType,
        visibleInterval,
        hiddenInterval,
        generateSubscriberId,
        handleUpdate,
        handleError,
    ]);

    // Unsubscribe from polling service
    const unsubscribe = useCallback(() => {
        if (subscriberIdRef.current) {
            pollingServiceRef.current.unsubscribe(subscriberIdRef.current);
            console.log(
                `useChatPolling: Unsubscribed ${subscriberIdRef.current}`
            );
            subscriberIdRef.current = null;
        }
    }, []);

    // Update polling status based on service status
    const updatePollingStatus = useCallback(() => {
        const status = pollingServiceRef.current.getStatus();
        setIsPolling(status.isPolling);
    }, []);

    // Effect to handle subscription lifecycle
    useEffect(() => {
        if (enabled && authToken) {
            subscribe();
            updatePollingStatus();
        } else {
            unsubscribe();
            setIsPolling(false);
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            unsubscribe();
        };
    }, [
        enabled,
        authToken,
        fetchType,
        visibleInterval,
        hiddenInterval,
        subscribe,
        unsubscribe,
        updatePollingStatus,
    ]);

    // Effect to update auth token in service when it changes
    useEffect(() => {
        pollingServiceRef.current.updateAuthToken(authToken);
    }, [authToken]);

    // Effect to update dispatch in service
    useEffect(() => {
        pollingServiceRef.current.setDispatch(dispatch);
    }, [dispatch]);

    // Effect to monitor polling status changes
    useEffect(() => {
        const checkPollingStatus = () => {
            updatePollingStatus();
        };

        // Check status periodically to keep hook state in sync
        const statusCheckInterval = setInterval(checkPollingStatus, 1000);

        return () => {
            clearInterval(statusCheckInterval);
        };
    }, [updatePollingStatus]);

    // Cleanup effect for component unmount
    useEffect(() => {
        return () => {
            // Ensure cleanup happens on unmount
            if (subscriberIdRef.current) {
                pollingServiceRef.current.unsubscribe(subscriberIdRef.current);
                subscriberIdRef.current = null;
            }
        };
    }, []);

    return {
        isPolling,
        error,
        lastUpdate,
    };
};

export default useChatPolling;
