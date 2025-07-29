package com.workorbit.backend.Chat.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user attempts to access a chat room they don't have permission for.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ChatAccessDeniedException extends RuntimeException {

    public ChatAccessDeniedException(String message) {
        super(message);
    }

    public ChatAccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }

    public ChatAccessDeniedException(Long chatRoomId, Long userId) {
        super("User " + userId + " does not have access to chat room " + chatRoomId);
    }
}