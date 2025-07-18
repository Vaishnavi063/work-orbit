package com.workorbit.backend.Auth.Controller;

import com.workorbit.backend.Auth.DTO.AuthResponse;
import com.workorbit.backend.Auth.DTO.ForgotPasswordRequest;
import com.workorbit.backend.Auth.DTO.LoginRequest;
import com.workorbit.backend.Auth.DTO.PasswordResponse;
import com.workorbit.backend.Auth.DTO.RegistrationRequest;
import com.workorbit.backend.Auth.DTO.ResetPasswordRequest;
import com.workorbit.backend.Auth.Service.AuthService;
import com.workorbit.backend.DTO.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/client")
    public ResponseEntity<ApiResponse<AuthResponse>> registerClient(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.ok(authService.registerClient(request));
    }

    @PostMapping("/register/freelancer")
    public ResponseEntity<ApiResponse<AuthResponse>> registerFreelancer(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.ok(authService.registerFreelancer(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<PasswordResponse>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse<PasswordResponse> response = authService.processForgotPasswordRequest(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

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
