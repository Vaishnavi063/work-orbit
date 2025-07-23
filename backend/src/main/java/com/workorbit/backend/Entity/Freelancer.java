package com.workorbit.backend.Entity;
import java.time.LocalDateTime;
import java.util.*;

import com.workorbit.backend.Auth.Entity.AppUser;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
public class Freelancer {

    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "app_user_id", referencedColumnName = "id")
    private AppUser appUser;

    private Double rating = 0.0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;


    @ManyToMany
    @JoinTable(
            name = "freelancer_skill",
            joinColumns= @JoinColumn(name="freelancer_id", referencedColumnName="id"),
            inverseJoinColumns= @JoinColumn(name="skill_id", referencedColumnName="id")
    )
    private Set<Skills>freelancerSkill = new HashSet<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PastWork> pastWorks = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bids> bids = new ArrayList<>();

}