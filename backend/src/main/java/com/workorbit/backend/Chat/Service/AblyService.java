package com.workorbit.backend.Chat.Service;

import com.workorbit.backend.Chat.Config.AblyConfig;
import com.workorbit.backend.Chat.Entity.ChatMessage;
import com.workorbit.backend.Chat.Entity.ChatRoom.ChatType;
import io.ably.lib.rest.AblyRest;
import io.ably.lib.rest.Channel;
import io.ably.lib.types.AblyException;
import io.ably.lib.rest.Auth.TokenDetails;
import io.ably.lib.rest.Auth.TokenParams;
import io.ably.lib.rest.Auth.AuthOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.google.gson.Gson;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;

/**
 * Service class for managing Ably real-time messaging operations.
 * Handles token generation, message publishing, and channel management.
 */
@Service
@Slf4j
public class AblyService {
    
    private final AblyRest ablyRest;
    private final AblyConfig ablyConfig;
    private final Gson gson = new Gson();
    
    // Channel naming constants
    private static final String BID_CHANNEL_PREFIX = "bid-chat:";
    private static final String CONTRACT_CHANNEL_PREFIX = "contract-chat:";
    private static final String TYPING_SUFFIX = ":typing";
    
    @Autowired
    public AblyService(AblyRest ablyRest, AblyConfig ablyConfig) {
        this.ablyRest = ablyRest;
        this.ablyConfig = ablyConfig;
    }
    
    /**
     * Generates a temporary Ably token for client authentication.
     * 
     * @param userId the user ID requesting the token
     * @param channels array of channel names the user should have access to
     * @return TokenDetails containing the temporary token
     * @throws AblyException if token generation fails
     */
    public TokenDetails generateAblyToken(String userId, String[] channels) throws AblyException {
        log.debug("Generating Ably token for user: {}", userId);
        
        // Create token parameters
        TokenParams tokenParams = new TokenParams();
        tokenParams.clientId = userId;
        tokenParams.ttl = ablyConfig.getTokenTtl() * 1000L; // Convert to milliseconds
        
        // Set channel-specific capabilities
        Map<String, Object> capabilities = new HashMap<>();
        
        // If channels array is empty or contains "*", grant access to all channels
        if (channels == null || channels.length == 0 || Arrays.asList(channels).contains("*")) {
            capabilities.put("*", new String[]{"publish", "subscribe", "presence"});
        } else {
            for (String channel : channels) {
                capabilities.put(channel, new String[]{"publish", "subscribe", "presence"});
                // Also grant access to typing indicator channel
                capabilities.put(channel + TYPING_SUFFIX, new String[]{"publish", "subscribe", "presence"});
            }
        }
        
        // Convert capabilities to proper JSON format
        tokenParams.capability = gson.toJson(capabilities);
        
        // For JWT tokens, we need to use the existing AblyRest instance
        // which was already configured with the JWT token
        return ablyRest.auth.authorize(tokenParams, null);
    }
    
    /**
     * Publishes a chat message to the appropriate Ably channel.
     * 
     * @param channelName the name of the channel to publish to
     * @param message the chat message to publish
     * @param chatRoomId the chat room ID to avoid lazy loading issues
     * @param senderName the sender's name
     */
    public void publishMessage(String channelName, ChatMessage message, Long chatRoomId, String senderName) {
        try {
            log.info("Attempting to publish message to channel: {}", channelName);
            log.info("Message details - ID: {}, Content: {}, SenderType: {}, SenderId: {}", 
                message.getId(), message.getContent(), message.getSenderType(), message.getSenderId());
            
            Channel channel = ablyRest.channels.get(channelName);
            Map<String, Object> messageData = createMessageData(message, chatRoomId, senderName);
            
            log.info("Publishing message to channel: {} with data: {}", channelName, messageData);
            
            channel.publish("message", messageData);
            log.info("Successfully published message to channel: {}", channelName);
            
        } catch (AblyException e) {
            log.error("AblyException occurred while publishing to channel: {} - Error code: {}, Message: {}", 
                channelName, e.errorInfo.code, e.getMessage(), e);
            throw new AblyServiceException("Failed to publish message to real-time channel", e);
        } catch (Exception e) {
            log.error("Unexpected error while publishing to channel: {} - Error: {}", 
                channelName, e.getMessage(), e);
            throw new AblyServiceException("Unexpected error during message publishing", e);
        }
    }
    
    /**
     * Publishes a system notification to the specified channel.
     * 
     * @param channelName the name of the channel to publish to
     * @param notification the notification message
     */
    public void publishSystemNotification(String channelName, String notification) {
        try {
            Channel channel = ablyRest.channels.get(channelName);
            
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("type", "SYSTEM_NOTIFICATION");
            notificationData.put("content", notification);
            notificationData.put("timestamp", System.currentTimeMillis());
            
            channel.publish("system", notificationData);
            log.debug("Published system notification to channel: {}", channelName);
        } catch (AblyException e) {
            log.error("Failed to publish system notification to channel: {}", channelName, e);
            throw new AblyServiceException("Failed to publish system notification", e);
        }
    }
    
    /**
     * Creates a standardized channel name for different chat types.
     * 
     * @param chatType the type of chat (BID_NEGOTIATION or CONTRACT)
     * @param referenceId the ID of the bid or contract
     * @return formatted channel name
     */
    public String createChannelName(ChatType chatType, Long referenceId) {
        return switch (chatType) {
            case BID_NEGOTIATION -> BID_CHANNEL_PREFIX + referenceId;
            case CONTRACT -> CONTRACT_CHANNEL_PREFIX + referenceId;
        };
    }
    
    /**
     * Creates a typing indicator channel name for the given chat channel.
     * 
     * @param baseChannelName the base chat channel name
     * @return typing indicator channel name
     */
    public String createTypingChannelName(String baseChannelName) {
        return baseChannelName + TYPING_SUFFIX;
    }
    
    /**
     * Publishes a typing indicator event to the typing channel.
     * 
     * @param channelName the base channel name
     * @param userId the ID of the user who is typing
     * @param isTyping whether the user is currently typing
     */
    public void publishTypingIndicator(String channelName, String userId, boolean isTyping) {
        String typingChannelName = createTypingChannelName(channelName);
        
        try {
            Channel channel = ablyRest.channels.get(typingChannelName);
            
            Map<String, Object> typingData = new HashMap<>();
            typingData.put("userId", userId);
            typingData.put("isTyping", isTyping);
            typingData.put("timestamp", System.currentTimeMillis());
            
            channel.publish("typing", typingData);
            log.debug("Published typing indicator for user: {} on channel: {}", userId, typingChannelName);
        } catch (AblyException e) {
            log.error("Failed to publish typing indicator for user: {} on channel: {}", userId, typingChannelName, e);
            throw new AblyServiceException("Failed to publish typing indicator", e);
        }
    }
    
    /**
     * Creates message data map for Ably publishing.
     * 
     * @param message the chat message
     * @param chatRoomId the chat room ID to avoid lazy loading issues
     * @param senderName the sender's name
     * @return map containing message data
     */
    private Map<String, Object> createMessageData(ChatMessage message, Long chatRoomId, String senderName) {
        Map<String, Object> messageData = new HashMap<>();
        
        try {
            // Use simple, guaranteed serializable values
            messageData.put("id", message.getId() != null ? message.getId().longValue() : 0L);
            messageData.put("chatRoomId", chatRoomId != null ? chatRoomId.longValue() : 0L);
            messageData.put("senderType", message.getSenderType() != null ? message.getSenderType().name() : "UNKNOWN");
            messageData.put("senderId", message.getSenderId() != null ? message.getSenderId().longValue() : 0L);
            messageData.put("senderName", senderName != null ? senderName : "Unknown");
            messageData.put("content", message.getContent() != null ? message.getContent() : "");
            messageData.put("messageType", message.getMessageType() != null ? message.getMessageType().name() : "TEXT");
            messageData.put("isRead", Boolean.valueOf(message.isRead()));
            
            // Use ISO string format for date
            if (message.getCreatedAt() != null) {
                messageData.put("createdAt", message.getCreatedAt().toString());
            } else {
                messageData.put("createdAt", java.time.LocalDateTime.now().toString());
            }
            
            log.info("Created message data for Ably: {}", messageData);
            
        } catch (Exception e) {
            log.error("Error creating message data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create message data for Ably", e);
        }
        
        return messageData;
    }
    
    /**
     * Custom exception for Ably service errors.
     */
    public static class AblyServiceException extends RuntimeException {
        public AblyServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}