package com.workorbit.backend.Chat.Service;

import com.workorbit.backend.Chat.Config.AblyConfig;
import com.workorbit.backend.Chat.Entity.ChatMessage;
import com.workorbit.backend.Chat.Entity.ChatRoom.ChatType;
import io.ably.lib.rest.AblyRest;
import io.ably.lib.rest.Channel;
import io.ably.lib.types.AblyException;
import io.ably.lib.rest.Auth.TokenDetails;
import io.ably.lib.rest.Auth.TokenParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service class for managing Ably real-time messaging operations.
 * Handles token generation, message publishing, and channel management.
 */
@Service
public class AblyService {

    private static final Logger logger = LoggerFactory.getLogger(AblyService.class);
    
    private final AblyRest ablyRest;
    private final AblyConfig ablyConfig;
    
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
        logger.debug("Generating Ably token for user: {} with channels: {}", userId, String.join(", ", channels));
        
        try {
            TokenParams tokenParams = new TokenParams();
            tokenParams.clientId = userId;
            tokenParams.ttl = ablyConfig.getTokenTtl() * 1000L; // Convert to milliseconds
            
            // Set channel-specific capabilities
            Map<String, String> capabilities = new HashMap<>();
            for (String channel : channels) {
                capabilities.put(channel, "publish,subscribe,presence");
                // Also grant access to typing indicator channel
                capabilities.put(channel + TYPING_SUFFIX, "publish,subscribe,presence");
            }
            tokenParams.capability = capabilities.toString();
            
            TokenDetails tokenDetails = ablyRest.auth.requestToken(tokenParams, null);
            logger.info("Successfully generated Ably token for user: {}", userId);
            return tokenDetails;
            
        } catch (AblyException e) {
            logger.error("Failed to generate Ably token for user: {}", userId, e);
            throw new AblyServiceException("Failed to generate authentication token", e);
        }
    }
    
    /**
     * Publishes a chat message to the appropriate Ably channel.
     * 
     * @param channelName the name of the channel to publish to
     * @param message the chat message to publish
     */
    public void publishMessage(String channelName, ChatMessage message) {
        logger.debug("Publishing message to channel: {}", channelName);
        
        try {
            Channel channel = ablyRest.channels.get(channelName);
            
            // Create message data for Ably
            Map<String, Object> messageData = createMessageData(message);
            
            channel.publish("message", messageData);
            logger.info("Successfully published message to channel: {}", channelName);
            
        } catch (AblyException e) {
            logger.error("Failed to publish message to channel: {}", channelName, e);
            throw new AblyServiceException("Failed to publish message to real-time channel", e);
        }
    }
    
    /**
     * Publishes a system notification to the specified channel.
     * 
     * @param channelName the name of the channel to publish to
     * @param notification the notification message
     */
    public void publishSystemNotification(String channelName, String notification) {
        logger.debug("Publishing system notification to channel: {}", channelName);
        
        try {
            Channel channel = ablyRest.channels.get(channelName);
            
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("type", "SYSTEM_NOTIFICATION");
            notificationData.put("content", notification);
            notificationData.put("timestamp", System.currentTimeMillis());
            
            channel.publish("system", notificationData);
            logger.info("Successfully published system notification to channel: {}", channelName);
            
        } catch (AblyException e) {
            logger.error("Failed to publish system notification to channel: {}", channelName, e);
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
        String channelName;
        
        channelName = switch (chatType) {
            case BID_NEGOTIATION -> BID_CHANNEL_PREFIX + referenceId;
            case CONTRACT -> CONTRACT_CHANNEL_PREFIX + referenceId;
        };
        
        logger.debug("Created channel name: {} for type: {} and reference ID: {}", 
                    channelName, chatType, referenceId);
        return channelName;
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
        logger.debug("Publishing typing indicator for user: {} on channel: {}", userId, typingChannelName);
        
        try {
            Channel channel = ablyRest.channels.get(typingChannelName);
            
            Map<String, Object> typingData = new HashMap<>();
            typingData.put("userId", userId);
            typingData.put("isTyping", isTyping);
            typingData.put("timestamp", System.currentTimeMillis());
            
            channel.publish("typing", typingData);
            logger.debug("Successfully published typing indicator for user: {}", userId);
            
        } catch (AblyException e) {
            logger.error("Failed to publish typing indicator for user: {} on channel: {}", 
                        userId, typingChannelName, e);
            throw new AblyServiceException("Failed to publish typing indicator", e);
        }
    }
    
    /**
     * Creates message data map for Ably publishing.
     * 
     * @param message the chat message
     * @return map containing message data
     */
    private Map<String, Object> createMessageData(ChatMessage message) {
        Map<String, Object> messageData = new HashMap<>();
        messageData.put("id", message.getId());
        messageData.put("chatRoomId", message.getChatRoom().getId());
        messageData.put("senderType", message.getSenderType().toString());
        messageData.put("senderId", message.getSenderId());
        messageData.put("content", message.getContent());
        messageData.put("messageType", message.getMessageType().toString());
        messageData.put("createdAt", message.getCreatedAt().toString());
        
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