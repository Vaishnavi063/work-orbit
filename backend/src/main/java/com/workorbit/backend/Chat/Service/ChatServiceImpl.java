package com.workorbit.backend.Chat.Service;

import com.workorbit.backend.Chat.DTO.*;
import com.workorbit.backend.Chat.Entity.ChatMessage;
import com.workorbit.backend.Chat.Entity.ChatRoom;
import com.workorbit.backend.Chat.Repository.ChatMessageRepository;
import com.workorbit.backend.Chat.Repository.ChatRoomRepository;
import com.workorbit.backend.Entity.*;
import com.workorbit.backend.Repository.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ChatService for managing chat operations including room creation,
 * message handling, and real-time communication integration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final BidRepository bidRepository;
    private final ContractRepository contractRepository;
    private final ClientRepository clientRepository;
    private final FreelancerRepository freelancerRepository;

    @Transactional
    @Override
    public ChatRoom createBidNegotiationChat(Long bidId) {
        log.info("Creating bid negotiation chat for bid ID: {}", bidId);
        
        // Check if chat room already exists
        if (chatRoomRepository.findByChatTypeAndReferenceId(ChatRoom.ChatType.BID_NEGOTIATION, bidId).isPresent()) {
            log.info("Bid negotiation chat already exists for bid ID: {}", bidId);
            return chatRoomRepository.findByChatTypeAndReferenceId(ChatRoom.ChatType.BID_NEGOTIATION, bidId).get();
        }
        
        // Fetch bid to get client and freelancer information
        Bids bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found with ID: " + bidId));
        
        log.info("Creating chat room for bid between client: {} and freelancer: {}", 
                bid.getProject().getClient().getName(), bid.getFreelancer().getName());
        
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setChatType(ChatRoom.ChatType.BID_NEGOTIATION);
        chatRoom.setReferenceId(bidId);
        chatRoom.setClient(bid.getProject().getClient());
        chatRoom.setFreelancer(bid.getFreelancer());
        chatRoom.setStatus(ChatRoom.ChatStatus.ACTIVE);
        
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        log.info("Successfully created bid negotiation chat room with ID: {}", savedChatRoom.getId());
        
        // Send welcome system message
        sendSystemNotification(savedChatRoom.getId(), 
                "Chat created for bid negotiation. You can now discuss project details.");
        
        return savedChatRoom;
    }

    @Override
    @Transactional
    public ChatRoom createContractChat(Long contractId) {
        log.info("Creating contract chat for contract ID: {}", contractId);
        
        // Check if chat room already exists
        if (chatRoomRepository.findByChatTypeAndReferenceId(ChatRoom.ChatType.CONTRACT, contractId).isPresent()) {
            log.info("Contract chat already exists for contract ID: {}", contractId);
            return chatRoomRepository.findByChatTypeAndReferenceId(ChatRoom.ChatType.CONTRACT, contractId).get();
        }
        
        // Fetch contract to get client and freelancer information through bid and project relationships
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found with ID: " + contractId));
        
        Client client = contract.getBid().getProject().getClient();
        Freelancer freelancer = contract.getBid().getFreelancer();
        
        log.info("Creating contract chat between client: {} and freelancer: {}", 
                client.getName(), freelancer.getName());
        
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setChatType(ChatRoom.ChatType.CONTRACT);
        chatRoom.setReferenceId(contractId);
        chatRoom.setClient(client);
        chatRoom.setFreelancer(freelancer);
        chatRoom.setStatus(ChatRoom.ChatStatus.ACTIVE);
        
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        log.info("Successfully created contract chat room with ID: {}", savedChatRoom.getId());
        
        // Send welcome system message
        sendSystemNotification(savedChatRoom.getId(), 
                "Contract chat created. You can now manage milestones and track project progress.");
        
        return savedChatRoom;
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request, Long userId, String userType) {
        log.info("Sending message to chat room: {} from user: {} ({})", 
                request.getChatRoomId(), userId, userType);
        
        // Validate chat room access
        ChatRoom chatRoom = findChatRoomById(request.getChatRoomId(), userId, userType);
        
        // Create and save message
        ChatMessage message = new ChatMessage();
        message.setChatRoom(chatRoom);
        message.setSenderType(ChatMessage.SenderType.valueOf(userType));
        message.setSenderId(userId);
        message.setContent(request.getContent());
        message.setMessageType(request.getMessageType());
        message.setRead(false);
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        log.info("Message saved with ID: {}", savedMessage.getId());
        
        // Update chat room's updated timestamp
        chatRoom.setUpdatedAt(LocalDateTime.now());
        chatRoomRepository.save(chatRoom);
        
        // Real-time message delivery will be handled by polling mechanism
        
        return mapToMessageResponse(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getChatHistory(Long chatRoomId, Pageable pageable, Long userId, String userType) {
        log.info("Retrieving chat history for room: {} by user: {} ({})", chatRoomId, userId, userType);
        
        // Validate chat room access
        findChatRoomById(chatRoomId, userId, userType);
        
        Page<ChatMessage> messages = chatMessageRepository.findByChatRoom_IdOrderByCreatedAtDesc(chatRoomId, pageable);
        log.info("Retrieved {} messages for chat room: {}", messages.getContent().size(), chatRoomId);
        
        return messages.map(this::mapToMessageResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getNewMessages(Long chatRoomId, LocalDateTime since, Long userId, String userType) {
        log.info("Retrieving new messages since {} for room: {} by user: {} ({})", 
                since, chatRoomId, userId, userType);
        
        // Validate chat room access
        findChatRoomById(chatRoomId, userId, userType);
        
        // Get messages created after the specified timestamp
        List<ChatMessage> newMessages = chatMessageRepository
                .findByChatRoom_IdAndCreatedAtAfterOrderByCreatedAtAsc(chatRoomId, since);
        
        log.info("Retrieved {} new messages for chat room: {} since {}", 
                newMessages.size(), chatRoomId, since);
        
        return newMessages.stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int markMessagesAsRead(Long chatRoomId, Long userId, String userType) {
        log.info("Marking messages as read for chat room: {} by user: {} ({})", chatRoomId, userId, userType);
        
        // Validate chat room access
        findChatRoomById(chatRoomId, userId, userType);
        
        int markedCount = chatMessageRepository.markMessagesAsReadForUser(chatRoomId, userType);
        log.info("Marked {} messages as read in chat room: {}", markedCount, chatRoomId);
        
        return markedCount;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getUserChatRooms(Long userId, String userType) {
        log.info("Retrieving chat rooms for user: {} ({})", userId, userType);
        
        List<ChatRoom> chatRooms = chatRoomRepository.findUserChatRooms(userId, userType);
        log.info("Found {} chat rooms for user: {}", chatRooms.size(), userId);
        
        return chatRooms.stream()
                .map(chatRoom -> mapToChatRoomResponse(chatRoom, userId, userType))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getActiveChatRooms(Long userId, String userType) {
        log.info("Retrieving active chat rooms for user: {} ({})", userId, userType);
        
        List<ChatRoom> activeChatRooms = chatRoomRepository.findActiveChatRoomsForUser(userId, userType);
        log.info("Found {} active chat rooms for user: {}", activeChatRooms.size(), userId);
        
        return activeChatRooms.stream()
                .map(chatRoom -> mapToChatRoomResponse(chatRoom, userId, userType))
                .collect(Collectors.toList());
    }



    @Override
    @Transactional(readOnly = true)
    public ChatRoom findChatRoomById(Long chatRoomId, Long userId, String userType) {
        log.debug("Finding chat room: {} for user: {} ({})", chatRoomId, userId, userType);
        
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found with ID: " + chatRoomId));
        
        // Validate user access to the chat room
        boolean hasAccess = false;
        if ("CLIENT".equals(userType) && chatRoom.getClient().getId().equals(userId)) {
            hasAccess = true;
        } else if ("FREELANCER".equals(userType) && chatRoom.getFreelancer().getId().equals(userId)) {
            hasAccess = true;
        }
        
        if (!hasAccess) {
            log.error("User: {} ({}) does not have access to chat room: {}", userId, userType, chatRoomId);
            throw new RuntimeException("Access denied to chat room");
        }
        
        return chatRoom;
    }

    @Override
    @Transactional
    public void sendSystemNotification(Long chatRoomId, String notification) {
        log.info("Sending system notification to chat room: {}", chatRoomId);
        
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found with ID: " + chatRoomId));
        
        // Create system message
        ChatMessage systemMessage = new ChatMessage();
        systemMessage.setChatRoom(chatRoom);
        systemMessage.setSenderType(ChatMessage.SenderType.SYSTEM);
        systemMessage.setSenderId(null);
        systemMessage.setContent(notification);
        systemMessage.setMessageType(ChatMessage.MessageType.SYSTEM_NOTIFICATION);
        systemMessage.setRead(false);
        
        ChatMessage savedMessage = chatMessageRepository.save(systemMessage);
        log.info("System notification saved with ID: {}", savedMessage.getId());
        
        // System notifications will be delivered through polling mechanism
    }
    
    @Override
    @Transactional
    public void sendBidSystemNotification(Long bidId, String notification) {
        log.info("Sending system notification to bid negotiation chat for bid: {}", bidId);
        
        ChatRoom chatRoom = chatRoomRepository.findByChatTypeAndReferenceId(ChatRoom.ChatType.BID_NEGOTIATION, bidId)
                .orElseThrow(() -> new RuntimeException("Bid negotiation chat room not found for bid ID: " + bidId));
        
        sendSystemNotification(chatRoom.getId(), notification);
        
        // If this is a rejection notification, close the chat room
        if (notification.toLowerCase().contains("rejected")) {
            closeBidChat(bidId);
        }
    }
    
    @Override
    @Transactional
    public ChatRoom convertToContractChat(Long bidId, Long contractId) {
        log.info("Converting bid chat to contract chat for bid: {} and contract: {}", bidId, contractId);
        
        // Find the bid negotiation chat room
        ChatRoom bidChatRoom = chatRoomRepository.findByChatTypeAndReferenceId(ChatRoom.ChatType.BID_NEGOTIATION, bidId)
                .orElseThrow(() -> new RuntimeException("Bid negotiation chat room not found for bid ID: " + bidId));
        
        // Update chat room to contract type
        bidChatRoom.setChatType(ChatRoom.ChatType.CONTRACT);
        bidChatRoom.setOriginalBidId(bidId); // Store original bid ID for reference
        bidChatRoom.setReferenceId(contractId); // Update reference ID to contract ID
        bidChatRoom.setStatus(ChatRoom.ChatStatus.ACTIVE); // Ensure status is active
        
        ChatRoom updatedChatRoom = chatRoomRepository.save(bidChatRoom);
        
        // Send transition notification to chat
        sendSystemNotification(updatedChatRoom.getId(), 
                "This chat has been converted to a contract chat. You can now manage milestones and track project progress.");
        
        log.info("Bid chat {} successfully converted to contract chat", updatedChatRoom.getId());
        
        return updatedChatRoom;
    }
    
    @Override
    @Transactional
    public void closeBidChat(Long bidId) {
        log.info("Closing bid chat for rejected bid: {}", bidId);
        
        // Find the bid negotiation chat room
        ChatRoom bidChatRoom = chatRoomRepository.findByChatTypeAndReferenceId(ChatRoom.ChatType.BID_NEGOTIATION, bidId)
                .orElseThrow(() -> new RuntimeException("Bid negotiation chat room not found for bid ID: " + bidId));
        
        // Mark bid chat as closed
        bidChatRoom.setStatus(ChatRoom.ChatStatus.CLOSED);
        chatRoomRepository.save(bidChatRoom);
        
        // Send closure notification to chat
        sendSystemNotification(bidChatRoom.getId(), 
                "This bid has been rejected. The chat is now closed.");
        
        log.info("Bid chat {} marked as closed due to bid rejection", bidChatRoom.getId());
    }
    
    /**
     * Legacy method maintained for backward compatibility.
     * Now delegates to convertToContractChat.
     */
    @Override
    @Transactional
    public void transitionBidChatToContract(Long bidId, Long contractId) {
        log.info("Legacy transitionBidChatToContract called, delegating to convertToContractChat");
        convertToContractChat(bidId, contractId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BidDetailsResponse getBidDetailsForChat(Long chatRoomId, Long userId, String userType) {
        log.info("Getting bid details for chat room: {} by user: {} ({})", chatRoomId, userId, userType);
        
        // Find and validate chat room access
        ChatRoom chatRoom = findChatRoomById(chatRoomId, userId, userType);
        
        // Validate that this is a bid negotiation chat
        if (chatRoom.getChatType() != ChatRoom.ChatType.BID_NEGOTIATION) {
            throw new RuntimeException("Chat room is not a bid negotiation chat");
        }
        
        // Get bid details
        Bids bid = bidRepository.findById(chatRoom.getReferenceId())
                .orElseThrow(() -> new RuntimeException("Bid not found with ID: " + chatRoom.getReferenceId()));
        
        // Determine if user can accept/reject (only clients can, and only for pending bids)
        boolean canAccept = "CLIENT".equals(userType) && 
                           bid.getStatus() == Bids.bidStatus.Pending &&
                           bid.getProject().getClient().getId().equals(userId);
        boolean canReject = canAccept; // Same conditions for reject
        
        return BidDetailsResponse.builder()
                .bidId(bid.getId())
                .projectId(bid.getProject().getId())
                .projectTitle(bid.getProject().getTitle())
                .freelancerId(bid.getFreelancer().getId())
                .freelancerName(bid.getFreelancer().getName())
                .proposal(bid.getProposal())
                .bidAmount(BigDecimal.valueOf(bid.getBidAmount()))
                .durationDays((int) bid.getDurationDays())
                .teamSize(bid.getTeamSize())
                .status(bid.getStatus().toString())
                .createdAt(bid.getCreatedAt())
                .canAccept(canAccept)
                .canReject(canReject)
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public ContractDetailsResponse getContractDetailsForChat(Long chatRoomId, Long userId, String userType) {
        log.info("Getting contract details for chat room: {} by user: {} ({})", chatRoomId, userId, userType);
        
        // Find and validate chat room access
        ChatRoom chatRoom = findChatRoomById(chatRoomId, userId, userType);
        
        // Validate that this is a contract chat
        if (chatRoom.getChatType() != ChatRoom.ChatType.CONTRACT) {
            throw new RuntimeException("Chat room is not a contract chat");
        }
        
        // Get contract details
        Contract contract = contractRepository.findById(chatRoom.getReferenceId())
                .orElseThrow(() -> new RuntimeException("Contract not found with ID: " + chatRoom.getReferenceId()));
        
        Bids bid = contract.getBid();
        Project project = contract.getProject();
        
        return ContractDetailsResponse.builder()
                .contractId(contract.getContractId())
                .projectId(project.getId())
                .projectTitle(project.getTitle())
                .bidId(bid.getId())
                .clientId(project.getClient().getId())
                .clientName(project.getClient().getName())
                .freelancerId(bid.getFreelancer().getId())
                .freelancerName(bid.getFreelancer().getName())
                .contractAmount(BigDecimal.valueOf(bid.getBidAmount()))
                .durationDays((int) bid.getDurationDays())
                .contractStatus(contract.getContractStatus().toString())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }

    /**
     * Maps ChatMessage entity to ChatMessageResponse DTO.
     */
    private ChatMessageResponse mapToMessageResponse(ChatMessage message) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(message.getId());
        response.setChatRoomId(message.getChatRoom().getId());
        response.setSenderType(message.getSenderType());
        response.setSenderId(message.getSenderId());
        response.setSenderName(getSenderName(message));
        response.setContent(message.getContent());
        response.setMessageType(message.getMessageType());
        response.setRead(message.isRead());
        response.setCreatedAt(message.getCreatedAt());
        
        return response;
    }

    /**
     * Maps ChatRoom entity to ChatRoomResponse DTO.
     */
    private ChatRoomResponse mapToChatRoomResponse(ChatRoom chatRoom, Long currentUserId, String currentUserType) {
        ChatRoomResponse response = new ChatRoomResponse();
        response.setId(chatRoom.getId());
        response.setChatType(chatRoom.getChatType());
        response.setReferenceId(chatRoom.getReferenceId());
        response.setStatus(chatRoom.getStatus());
        response.setCreatedAt(chatRoom.getCreatedAt());
        response.setUpdatedAt(chatRoom.getUpdatedAt());
        
        // Set other party information
        ChatRoomResponse.OtherParty otherParty = new ChatRoomResponse.OtherParty();
        if ("CLIENT".equals(currentUserType)) {
            otherParty.setId(chatRoom.getFreelancer().getId());
            otherParty.setName(chatRoom.getFreelancer().getName());
            otherParty.setType("FREELANCER");
        } else {
            otherParty.setId(chatRoom.getClient().getId());
            otherParty.setName(chatRoom.getClient().getName());
            otherParty.setType("CLIENT");
        }
        response.setOtherParty(otherParty);
        
        // Get last message
        ChatMessage lastMessage = chatMessageRepository.findLatestMessageInChatRoom(chatRoom.getId());
        if (lastMessage != null) {
            response.setLastMessage(mapToMessageResponse(lastMessage));
        }
        
        // Get unread count
        Long unreadCount = chatMessageRepository.countUnreadMessagesForUser(chatRoom.getId(), currentUserType);
        response.setUnreadCount(unreadCount);
        
        return response;
    }

    @Override
    public ChatRoomResponse getChatRoomResponse(ChatRoom chatRoom, Long userId, String userType) {
        log.debug("Converting ChatRoom {} to response for user: {} ({})", chatRoom.getId(), userId, userType);
        return mapToChatRoomResponse(chatRoom, userId, userType);
    }

    /**
     * Gets the sender name for a chat message.
     */
    private String getSenderName(ChatMessage message) {
        if (message.getSenderType() == ChatMessage.SenderType.SYSTEM) {
            return "System";
        }
        
        if (message.getSenderId() == null) {
            return "Unknown";
        }
        
        try {
            if (message.getSenderType() == ChatMessage.SenderType.CLIENT) {
                Client client = clientRepository.findById(message.getSenderId()).orElse(null);
                return client != null ? client.getName() : "Unknown Client";
            } else if (message.getSenderType() == ChatMessage.SenderType.FREELANCER) {
                Freelancer freelancer = freelancerRepository.findById(message.getSenderId()).orElse(null);
                return freelancer != null ? freelancer.getName() : "Unknown Freelancer";
            }
        } catch (Exception e) {
            log.warn("Failed to get sender name for message: {}", message.getId(), e);
        }
        
        return "Unknown";
    }
}