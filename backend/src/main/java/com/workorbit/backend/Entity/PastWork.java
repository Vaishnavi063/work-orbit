package com.workorbit.backend.Entity;

import jakarta.persistence.*;

@Entity
public class PastWork {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long experience_id;

    private String title;
    private String link;
    private String description;

    @ManyToOne
    @JoinColumn(name = "freelancer_id", referencedColumnName="f_id")
    private Freelancer freelancer;


    public PastWork() {
        // TODO Auto-generated constructor stub
    }


    public PastWork(Long experience_id, String title, String link, String description, Freelancer freelaner) {
        super();
        this.experience_id = experience_id;
        this.title = title;
        this.link = link;
        this.description = description;
    }


    public Long getExperience_id() {
        return experience_id;
    }


    public void setExperience_id(Long experience_id) {
        this.experience_id = experience_id;
    }


    public String getTitle() {
        return title;
    }


    public void setTitle(String title) {
        this.title = title;
    }


    public String getLink() {
        return link;
    }


    public void setLink(String link) {
        this.link = link;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }



    @Override
    public String toString() {
        return "PastWork [experience_id=" + experience_id + ", title=" + title + ", link=" + link + ", description="
                + description + "]";
    }


}
