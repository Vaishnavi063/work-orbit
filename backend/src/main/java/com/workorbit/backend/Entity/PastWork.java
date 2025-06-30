package com.workorbit.backend.Entity;

import jakarta.persistence.*;

@Entity
public class PastWork {

    @Id
    @GeneratedValue
    private Long id;

    private String title;
    private String link;
    private String description;

    @ManyToOne
    @JoinColumn(name = "freelancer_id", referencedColumnName="id")
    private Freelancer freelancer;

    @Override
    public String toString() {
        return "PastWork{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", link='" + link + '\'' +
                ", description='" + description + '\'' +
                ", freelancer=" + freelancer +
                '}';
    }
}
