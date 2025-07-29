package com.workorbit.backend.Auth.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "User login request containing email and password credentials")
public class LoginRequest {

    @Schema(
        description = "User email address used for authentication",
        example = "john.doe@example.com",
        required = true
    )
    @Email(regexp = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "invalid email format")
    @NotBlank(message = "email is required")
    private String email;

    @Schema(
        description = "User password for authentication",
        example = "mySecurePassword123",
        required = true
    )
    @NotBlank(message = "password is required")
    private String password;
}
