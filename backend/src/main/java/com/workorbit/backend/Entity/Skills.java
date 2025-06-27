package com.workorbit.backend.Entity;
import java.util.*;
import jakarta.persistence.*;

@Entity
public class Skills {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long s_id;

    private String s_name;

    @ManyToMany(mappedBy = "f_skill")
    private Set<Freelancer> freelancers = new HashSet<>();

    public Skills() {
        // TODO Auto-generated constructor stub
    }

    public Skills(Long s_id, String s_name, Set<Freelancer> freelancers) {
        super();
        this.s_id = s_id;
        this.s_name = s_name;
        this.freelancers = freelancers;
    }

    public Long getS_id() {
        return s_id;
    }

    public void setS_id(Long s_id) {
        this.s_id = s_id;
    }

    public String getS_name() {
        return s_name;
    }

    public void setS_name(String s_name) {
        this.s_name = s_name;
    }

    public Set<Freelancer> getFreelancers() {
        return freelancers;
    }

    public void setFreelancers(Set<Freelancer> freelancers) {
        this.freelancers = freelancers;
    }

    @Override
    public String toString() {
        return "Skills [s_id=" + s_id + ", s_name=" + s_name + ", freelancers=" + freelancers + "]";
    }



}
