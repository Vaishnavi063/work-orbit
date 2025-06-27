package com.workorbit.backend.Entity;
import java.util.*;
import jakarta.persistence.*;

@Entity
public class Freelancer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long f_id;


    private String f_name;

    private String email;

    @ManyToMany
    @JoinTable(
            name = "freelancer_skill",
            joinColumns= @JoinColumn(name="freelancer_id", referencedColumnName="f_id"),
            inverseJoinColumns= @JoinColumn(name="skill_id", referencedColumnName="s_id")
    )
    private Set<Skills>f_skill = new HashSet<>();

    @OneToMany(mappedBy = "freelancer")
    private List<PastWork> f_experience = new ArrayList<>();



    public Freelancer() {
        // TODO Auto-generated constructor stub
    }

    public Freelancer(Long f_id, String f_name, String email, Set<Skills> f_skill, List<PastWork> f_experience) {
        super();
        this.f_id = f_id;
        this.f_name = f_name;
        this.email = email;
        this.f_skill = f_skill;
        this.f_experience = f_experience;
    }

    public Long getF_id() {
        return f_id;
    }

    public void setF_id(Long f_id) {
        this.f_id = f_id;
    }

    public String getF_name() {
        return f_name;
    }

    public void setF_name(String f_name) {
        this.f_name = f_name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Set<Skills> getF_skill() {
        return f_skill;
    }

    public void setF_skill(Set<Skills> f_skill) {
        this.f_skill = f_skill;
    }

    public List<PastWork> getF_experience() {
        return f_experience;
    }

    public void setF_experience(List<PastWork> f_experience) {
        this.f_experience = f_experience;
    }

    @Override
    public String toString() {
        return "Freelancer{" +
                "f_id=" + f_id +
                ", f_name='" + f_name + '\'' +
                ", email='" + email + '\'' +
                ", f_skill=" + f_skill +
                ", f_experience=" + f_experience +
                '}';
    }
}
