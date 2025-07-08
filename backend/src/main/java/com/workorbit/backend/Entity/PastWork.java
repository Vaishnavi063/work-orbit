package com.workorbit.backend.Entity;

import jakarta.persistence.*;
import lombok.*;


@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class PastWork {

    @Id
    @GeneratedValue
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String link;
    @Column(nullable = false)
    private String description;

    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;
}
