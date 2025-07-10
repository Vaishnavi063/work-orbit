package com.workorbit.backend.Auth.Service;

import com.workorbit.backend.Auth.DTO.AppUserDetails;
import com.workorbit.backend.Auth.Repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AppUserRepository appUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        return appUserRepository.findByEmail(username)
                .map(AppUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("user not found with username: " + username));
    }
}
