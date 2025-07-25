package com.workorbit.backend.Chat.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when an invalid operation is attempted on a chat room,
 * such as trying to send a message to a closed chat or performing an action
 * that is not allowed in the current chat state.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidChatOperationException extends RuntimeException {

    public InvalidChatOperationException(String message) {
        super(message);
    }

    public InvalidChatOperationException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidChatOperationException(Long chatRoomId, String operation) {
        super("Invalid operation '" + operation + "' attempted on chat room " + chatRoomId);
    }
}