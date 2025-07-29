package com.workorbit.backend.Chat.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when there is an error transitioning a chat room from one state to another,
 * such as converting a bid negotiation chat to a contract chat.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ChatTransitionException extends RuntimeException {

    public ChatTransitionException(String message) {
        super(message);
    }

    public ChatTransitionException(String message, Throwable cause) {
        super(message, cause);
    }

    public ChatTransitionException(Long chatRoomId, String fromType, String toType) {
        super("Failed to transition chat room " + chatRoomId + " from " + fromType + " to " + toType);
    }
}