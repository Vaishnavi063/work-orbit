package com.workorbit.backend.Entity;
import java.util.*;
import jakarta.persistence.*;
import lombok.*;


@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class Skills {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @ManyToMany(mappedBy = "freelancerSkill")
    private Set<Freelancer> freelancers = new HashSet<>();
}
