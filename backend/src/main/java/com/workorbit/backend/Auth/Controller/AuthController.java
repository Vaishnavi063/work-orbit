package com.workorbit.backend.Auth.Controller;

import com.workorbit.backend.Auth.DTO.AuthResponse;
import com.workorbit.backend.Auth.DTO.LoginRequest;
import com.workorbit.backend.Auth.DTO.RegistrationRequest;
import com.workorbit.backend.Auth.Service.AuthService;
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
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/client")
    public ResponseEntity<AuthResponse> registerClient(@RequestBody RegistrationRequest request) {

        return ResponseEntity.ok(authService.registerClient(request));
    }

    @PostMapping("/register/freelancer")
    public ResponseEntity<AuthResponse> registerFreelancer(@RequestBody RegistrationRequest request) {

        return ResponseEntity.ok(authService.registerFreelancer(request));
    }
}
