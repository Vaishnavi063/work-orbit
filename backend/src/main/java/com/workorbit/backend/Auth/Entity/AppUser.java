package com.workorbit.backend.Auth.Entity;

import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Freelancer;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(indexes = {
        @Index(name = "idx_app_user_reset_password_token", columnList = "reset_password_token", unique = true)
})
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @OneToOne(mappedBy = "appUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private Client clientProfile;

    @OneToOne(mappedBy = "appUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private Freelancer freelancerProfile;

    private String resetPasswordToken;

    private LocalDateTime resetPasswordTokenExpiry;
}
