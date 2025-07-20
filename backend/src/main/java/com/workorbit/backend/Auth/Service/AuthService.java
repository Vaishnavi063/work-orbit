package com.workorbit.backend.Auth.Service;

import com.workorbit.backend.Auth.DTO.*;
import com.workorbit.backend.Auth.Entity.AppUser;
import com.workorbit.backend.Auth.Entity.Role;
import com.workorbit.backend.Auth.Repository.AppUserRepository;
import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Freelancer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
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
        log.info("Authenticating user: {}", request.getEmail());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        log.info("Authentication successful");

        // if we reach here, authentication was successful and Auth obj is authenticated
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        log.info("Token generated");

        AppUserDetails appUserDetails = (AppUserDetails) userDetails;
        log.info("AppUserDetails created");
        return ApiResponse.success(createAuthResponse(appUserDetails, token));
    }

    public ApiResponse<AuthResponse> registerClient(RegistrationRequest request) {
        log.info("Registering client: {}", request.getEmail());
        return register(request, Role.ROLE_CLIENT);
    }

    public ApiResponse<AuthResponse> registerFreelancer(RegistrationRequest request) {
        log.info("Registering freelancer: {}", request.getEmail());
        return register(request, Role.ROLE_FREELANCER);
    }

    private ApiResponse<AuthResponse> register(RegistrationRequest request, Role role) {
        log.info("Registering user: {}", request.getEmail());
        if (appUserRepository.findByEmail(request.getEmail()).isPresent()) {
            log.error("User already exists");
            throw new RuntimeException("user already exists");
        }

        log.info("User does not exist, creating new user");
        AppUser appUser = new AppUser();
        appUser.setEmail(request.getEmail());
        appUser.setPassword(passwordEncoder.encode(request.getPassword()));
        appUser.setRole(role);

        if (role == Role.ROLE_CLIENT) {
            log.info("Creating client profile");
            Client clientProfile = new Client();
            clientProfile.setName(request.getName());
            clientProfile.setAppUser(appUser);
            appUser.setClientProfile(clientProfile);
        } else if (role == Role.ROLE_FREELANCER) {
            log.info("Creating freelancer profile");
            Freelancer freelancerProfile = new Freelancer();
            freelancerProfile.setName(request.getName());
            freelancerProfile.setAppUser(appUser);
            appUser.setFreelancerProfile(freelancerProfile);
        }

        log.info("Saving user");
        AppUser savedUser = appUserRepository.save(appUser);
        log.info("User saved");

        AppUserDetails appUserDetails = new AppUserDetails(savedUser);
        log.info("AppUserDetails created");

        // generate a token for immediate login
        String token = jwtService.generateToken(new AppUserDetails(savedUser));
        log.info("Token generated");
        return ApiResponse.success(createAuthResponse(appUserDetails, token));
    }

    public ApiResponse<PasswordResponse> processForgotPasswordRequest(ForgotPasswordRequest request) {
        try {
            log.info("Password reset request received for email: {}", request.getEmail());
            Optional<AppUser> userOptional = appUserRepository.findByEmail(request.getEmail());

            if (userOptional.isPresent()) {
                AppUser user = userOptional.get();
                log.info("User found: {}", user.getEmail());

                String resetToken = UUID.randomUUID().toString();
                log.info("Reset token generated");

                LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(1);

                // invalidate any existing token by setting new one
                user.setResetPasswordToken(resetToken);
                user.setResetPasswordTokenExpiry(tokenExpiry);
                log.info("User updated with new token");

                // save user with new token
                appUserRepository.save(user);
                log.info("User saved");

                String userName = getUserName(user);
                log.info("User name: {}", userName);

                emailService.sendPasswordResetEmail(user.getEmail(), resetToken, userName);
                log.info("Email sent");
            } else {
                log.error("Password reset requested for non-existent email: {}", request.getEmail());
            }
            log.info("Password reset request processed");
            // always return success message to prevent user enumeration
            return ApiResponse.success(
                createPasswordResponse("If your email is registered with us, you will receive a password reset link shortly.")
            );
        } catch (Exception e) {
            log.error("Error processing forgot password request for email: {} - {}", request.getEmail(), e.getMessage());
            return ApiResponse.error("An error occurred while processing your request. Please try again later.");
        }
    }

    public ApiResponse<PasswordResponse> resetPassword(ResetPasswordRequest request) {
        try {
            log.info("Password reset attempt with token: {}", request.getToken());
            Optional<AppUser> userOptional = appUserRepository.findByResetPasswordToken(request.getToken());

            if (userOptional.isEmpty()) {
                log.error("Invalid reset token used: {}", request.getToken());
                return ApiResponse.error("Invalid or expired reset token.");
            }
            AppUser user = userOptional.get();
            log.info("User found: {}", user.getEmail());

            // check if token has expired
            if (user.getResetPasswordTokenExpiry() == null ||
                LocalDateTime.now().isAfter(user.getResetPasswordTokenExpiry())) {

                // clear expired token
                user.setResetPasswordToken(null);
                user.setResetPasswordTokenExpiry(null);
                appUserRepository.save(user);
                log.info("User saved");

                return ApiResponse.error("Reset token has expired. Please request a new password reset.");
            }

            // update password with new encrypted password
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            log.info("Password updated");

            // invalidate the reset token immediately after use
            user.setResetPasswordToken(null);
            user.setResetPasswordTokenExpiry(null);
            log.info("Reset token invalidated");

            appUserRepository.save(user);
            log.info("User saved");
            log.info("Password successfully reset for user: {}", user.getEmail());
            return ApiResponse.success(
                    createPasswordResponse("Your password has been successfully reset. You can now log in with your new password.")
            );
        } catch (Exception e) {
            log.error("Error resetting password with token: {} - {}", request.getToken(), e.getMessage());
            return ApiResponse.error("An error occurred while resetting your password. Please try again.");
        }
    }

    private String getUserName(AppUser user) {
        log.info("Getting user name for user: {}", user.getEmail());
        if (user.getClientProfile() != null && user.getClientProfile().getName() != null) {
            log.info("Client profile found");
            return user.getClientProfile().getName();
        } else if (user.getFreelancerProfile() != null && user.getFreelancerProfile().getName() != null) {
            log.info("Freelancer profile found");
            return user.getFreelancerProfile().getName();
        } else {
            // fallback to email if no name is available
            log.info("No profile found, using email");
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
