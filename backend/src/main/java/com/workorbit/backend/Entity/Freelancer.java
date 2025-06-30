package com.workorbit.backend.Entity;
import java.time.LocalDateTime;
import java.util.*;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
public class Freelancer {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private String email;

    private String password;

    private Double rating;

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

    @OneToMany(mappedBy = "freelancer")
    private List<PastWork> pastWorks = new ArrayList<>();

    @Override
    public String toString() {
        return "Freelancer{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", rating=" + rating +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", freelancerSkill=" + freelancerSkill +
                ", pastWorks=" + pastWorks +
                '}';
    }
}
