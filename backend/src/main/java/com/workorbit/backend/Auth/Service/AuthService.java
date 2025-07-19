package com.workorbit.backend.Auth.Service;

import com.workorbit.backend.Auth.DTO.*;
import com.workorbit.backend.Auth.Entity.AppUser;
import com.workorbit.backend.Auth.Entity.Role;
import com.workorbit.backend.Auth.Repository.AppUserRepository;
import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Freelancer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public ApiResponse<AuthResponse> login(LoginRequest request) {

        // authenticating using the manager, currently Auth obj is unauthenticated
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // if we reach here, authentication was successful and Auth obj is authenticated
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);

        AppUserDetails appUserDetails = (AppUserDetails) userDetails;

        return ApiResponse.success(createAuthResponse(appUserDetails, token));
    }

    public ApiResponse<AuthResponse> registerClient(RegistrationRequest request) {
        return register(request, Role.ROLE_CLIENT);
    }

    public ApiResponse<AuthResponse> registerFreelancer(RegistrationRequest request) {
        return register(request, Role.ROLE_FREELANCER);
    }

    private ApiResponse<AuthResponse> register(RegistrationRequest request, Role role) {

        if (appUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("user already exists");
        }

        AppUser appUser = new AppUser();
        appUser.setEmail(request.getEmail());
        appUser.setPassword(passwordEncoder.encode(request.getPassword()));
        appUser.setRole(role);

        if (role == Role.ROLE_CLIENT) {

            Client clientProfile = new Client();
            clientProfile.setName(request.getName());
            clientProfile.setAppUser(appUser);
            appUser.setClientProfile(clientProfile);
        } else if (role == Role.ROLE_FREELANCER) {

            Freelancer freelancerProfile = new Freelancer();
            freelancerProfile.setName(request.getName());
            freelancerProfile.setAppUser(appUser);
            appUser.setFreelancerProfile(freelancerProfile);
        }

        AppUser savedUser = appUserRepository.save(appUser);
        AppUserDetails appUserDetails = new AppUserDetails(savedUser);

        // generate a token for immediate login
        String token = jwtService.generateToken(new AppUserDetails(savedUser));

        return ApiResponse.success(createAuthResponse(appUserDetails, token));
    }

    public ApiResponse<PasswordResponse> processForgotPasswordRequest(ForgotPasswordRequest request) {
        try {
            System.out.printf("Password reset request received for email: %s%n", request.getEmail());

            Optional<AppUser> userOptional = appUserRepository.findByEmail(request.getEmail());

            if (userOptional.isPresent()) {
                AppUser user = userOptional.get();

                String resetToken = UUID.randomUUID().toString();

                LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(1);

                // invalidate any existing token by setting new one
                user.setResetPasswordToken(resetToken);
                user.setResetPasswordTokenExpiry(tokenExpiry);

                // save user with new token
                appUserRepository.save(user);

                String userName = getUserName(user);

                emailService.sendPasswordResetEmail(user.getEmail(), resetToken, userName);

                System.out.printf("Password reset token generated and email sent for user: %s%n", request.getEmail());
            } else {
                System.err.printf("Password reset requested for non-existent email: %s%n", request.getEmail());
            }

            // always return success message to prevent user enumeration
            return ApiResponse.success(
                createPasswordResponse("If your email is registered with us, you will receive a password reset link shortly.")
            );

        } catch (Exception e) {
            System.err.printf("Error processing forgot password request for email: %s - %s%n", request.getEmail(), e.getMessage());
            return ApiResponse.error("An error occurred while processing your request. Please try again later.");
        }
    }

    public ApiResponse<PasswordResponse> resetPassword(ResetPasswordRequest request) {
        try {
            System.out.printf("Password reset attempt with token: %s%n", request.getToken());

            Optional<AppUser> userOptional = appUserRepository.findByResetPasswordToken(request.getToken());

            if (userOptional.isEmpty()) {
                System.err.printf("Invalid reset token used: %s%n", request.getToken());
                return ApiResponse.error("Invalid or expired reset token.");
            }

            AppUser user = userOptional.get();

            // check if token has expired
            if (user.getResetPasswordTokenExpiry() == null ||
                LocalDateTime.now().isAfter(user.getResetPasswordTokenExpiry())) {
                System.err.printf("Expired reset token used for user: %s%n", user.getEmail());

                // clear expired token
                user.setResetPasswordToken(null);
                user.setResetPasswordTokenExpiry(null);
                appUserRepository.save(user);

                return ApiResponse.error("Reset token has expired. Please request a new password reset.");
            }

            // update password with new encrypted password
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            // invalidate the reset token immediately after use
            user.setResetPasswordToken(null);
            user.setResetPasswordTokenExpiry(null);

            appUserRepository.save(user);

            System.out.printf("Password successfully reset for user: %s%n", user.getEmail());

            return ApiResponse.success(
                    createPasswordResponse("Your password has been successfully reset. You can now log in with your new password.")
            );

        } catch (Exception e) {
            System.err.printf("Error resetting password with token: %s - %s%n", request.getToken(), e.getMessage());
            return ApiResponse.error("An error occurred while resetting your password. Please try again.");
        }
    }

    private String getUserName(AppUser user) {
        if (user.getClientProfile() != null && user.getClientProfile().getName() != null) {
            return user.getClientProfile().getName();
        } else if (user.getFreelancerProfile() != null && user.getFreelancerProfile().getName() != null) {
            return user.getFreelancerProfile().getName();
        } else {
            // fallback to email if no name is available
            return user.getEmail();
        }
    }

    private AuthResponse createAuthResponse(AppUserDetails userDetails, String token) {
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("UNKNOWN_ROLE");

        return AuthResponse.builder()
                .id(userDetails.getProfileId())
                .name(userDetails.getName())
                .email(userDetails.getUsername())
                .role(role)
                .token(token)
                .build();
    }


    private PasswordResponse createPasswordResponse(String message) {
        return PasswordResponse.builder()
                .message(message)
                .build();
    }
}
