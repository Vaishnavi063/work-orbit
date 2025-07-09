package com.workorbit.backend.Auth.Service;

import com.workorbit.backend.Auth.DTO.AppUserDetails;
import com.workorbit.backend.Auth.DTO.AuthResponse;
import com.workorbit.backend.Auth.DTO.LoginRequest;
import com.workorbit.backend.Auth.DTO.RegistrationRequest;
import com.workorbit.backend.Auth.Entity.AppUser;
import com.workorbit.backend.Auth.Entity.Role;
import com.workorbit.backend.Auth.Repository.AppUserRepository;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Freelancer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {

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

        return AuthResponse.builder()
                .token(token)
                .build();
    }

    public AuthResponse registerClient(RegistrationRequest request) {

        return register(request, Role.ROLE_CLIENT);
    }

    public AuthResponse registerFreelancer(RegistrationRequest request) {

        return register(request, Role.ROLE_FREELANCER);
    }

    private AuthResponse register(RegistrationRequest request, Role role) {

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

        // generate a token for immediate login
        String token = jwtService.generateToken(new AppUserDetails(savedUser));

        return AuthResponse.builder()
                .token(token)
                .build();
    }
}
