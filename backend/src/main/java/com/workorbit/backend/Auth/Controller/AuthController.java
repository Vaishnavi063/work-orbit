package com.workorbit.backend.Auth.Controller;

import com.workorbit.backend.Auth.DTO.AuthResponse;
import com.workorbit.backend.Auth.DTO.ForgotPasswordRequest;
import com.workorbit.backend.Auth.DTO.LoginRequest;
import com.workorbit.backend.Auth.DTO.PasswordResponse;
import com.workorbit.backend.Auth.DTO.RegistrationRequest;
import com.workorbit.backend.Auth.DTO.ResetPasswordRequest;
import com.workorbit.backend.Auth.Service.AuthService;
import com.workorbit.backend.DTO.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Authentication", description = "User authentication and registration endpoints")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(
        summary = "User login",
        description = "Authenticate user with email and password credentials"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Login successful - returns JWT token and user information"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - validation errors or malformed request body"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "Authentication failed - invalid email or password"
        )
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(
        summary = "Register new client",
        description = "Create a new client account with the provided registration details"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Client registration successful - returns JWT token and user information"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Registration failed - validation errors, email already exists, or invalid data"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409", 
            description = "Conflict - email address already registered"
        )
    })
    @PostMapping("/register/client")
    public ResponseEntity<ApiResponse<AuthResponse>> registerClient(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.ok(authService.registerClient(request));
    }

    @Operation(
        summary = "Register new freelancer",
        description = "Create a new freelancer account with the provided registration details"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Freelancer registration successful - returns JWT token and user information"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Registration failed - validation errors, email already exists, or invalid data"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409", 
            description = "Conflict - email address already registered"
        )
    })
    @PostMapping("/register/freelancer")
    public ResponseEntity<ApiResponse<AuthResponse>> registerFreelancer(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.ok(authService.registerFreelancer(request));
    }

    @Operation(
        summary = "Request password reset",
        description = "Send password reset instructions to the user's email address"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Password reset email sent successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - validation errors or email not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "Email address not found in the system"
        )
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<PasswordResponse>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse<PasswordResponse> response = authService.processForgotPasswordRequest(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @Operation(
        summary = "Reset user password",
        description = "Reset user password using the provided reset token and new password"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Password reset successful"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request - validation errors, invalid token, or expired token"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "Invalid or expired reset token"
        )
    })
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<PasswordResponse>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        ApiResponse<PasswordResponse> response = authService.resetPassword(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
