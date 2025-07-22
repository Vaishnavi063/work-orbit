package com.workorbit.backend.Chat.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class AblyTokenResponse {
    
    private String token;
    private Long expiresAt;
    private String clientId;
}