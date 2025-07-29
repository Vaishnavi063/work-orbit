package com.workorbit.backend.Auth.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "User registration request containing user details for account creation")
public class RegistrationRequest {

    @Schema(
        description = "Full name of the user",
        example = "John Doe",
        required = true
    )
    @NotBlank(message = "name is required")
    private String name;

    @Schema(
        description = "Email address for the new user account",
        example = "john.doe@example.com",
        required = true
    )
    @Email(regexp = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "invalid email format")
    @NotBlank(message = "email is required")
    private String email;

    @Schema(
        description = "Password for the new user account (8-20 characters)",
        example = "mySecurePassword123",
        required = true,
        minLength = 8,
        maxLength = 20
    )
    @NotBlank(message = "password is required")
    @Size(min = 8, max = 20, message = "password must be between 8 and 20 characters")
    private String password;
}
