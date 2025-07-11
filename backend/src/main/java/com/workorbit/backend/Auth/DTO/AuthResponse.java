package com.workorbit.backend.Auth.DTO;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private final String role;
    private final String name;
    private final String email;
    private final String token;
}
