package com.workorbit.backend.Auth.DTO;

import com.workorbit.backend.Auth.Entity.AppUser;
import com.workorbit.backend.Auth.Entity.Role;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class AppUserDetails implements UserDetails {

    private final String username;
    private final String password;
    private final String name;
    private final Collection<? extends GrantedAuthority> authorities;

    public AppUserDetails(AppUser appUser) {
        this.username = appUser.getEmail();
        this.password = appUser.getPassword();
        if (appUser.getRole() == Role.ROLE_CLIENT) {
            this.name = appUser.getClientProfile().getName();
        } else {
            this.name = appUser.getFreelancerProfile().getName();
        }
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(appUser.getRole().toString()));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }
}
