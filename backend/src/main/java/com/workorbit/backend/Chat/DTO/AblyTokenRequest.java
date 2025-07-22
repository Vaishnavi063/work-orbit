package com.workorbit.backend.Chat.DTO;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class AblyTokenRequest {
    
    @NotEmpty(message = "Channels list cannot be empty")
    private String[] channels;
}