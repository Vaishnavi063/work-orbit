package com.workorbit.backend.Chat.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a requested chat room cannot be found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ChatRoomNotFoundException extends RuntimeException {

    public ChatRoomNotFoundException(String message) {
        super(message);
    }

    public ChatRoomNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public ChatRoomNotFoundException(Long chatRoomId) {
        super("Chat room not found with ID: " + chatRoomId);
    }
}