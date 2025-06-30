package com.workorbit.backend.Entity;
import java.util.*;
import jakarta.persistence.*;

@Entity
public class Skills {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @ManyToMany(mappedBy = "freelancerSkill")
    private Set<Freelancer> freelancers = new HashSet<>();

    @Override
    public String toString() {
        return "Skills{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", freelancers=" + freelancers +
                '}';
    }
}
