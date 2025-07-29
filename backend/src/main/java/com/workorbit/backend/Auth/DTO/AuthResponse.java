package com.workorbit.backend.Auth.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Authentication response containing user details and JWT token")
public class AuthResponse {

    @Schema(
        description = "Unique identifier of the authenticated user",
        example = "12345"
    )
    private final Long id;

    @Schema(
        description = "Role of the authenticated user",
        example = "FREELANCER",
        allowableValues = {"FREELANCER", "CLIENT"}
    )
    private final String role;

    @Schema(
        description = "Full name of the authenticated user",
        example = "John Doe"
    )
    private final String name;

    @Schema(
        description = "Email address of the authenticated user",
        example = "john.doe@example.com"
    )
    private final String email;

    @Schema(
        description = "JWT authentication token for API access",
        example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    private final String token;
}
