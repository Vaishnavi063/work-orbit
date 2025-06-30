package com.workorbit.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "projects")
public class ProjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Long budget;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_Id", nullable = false)
    private ClientEntity clientId;

    @Column(nullable = false)
    private ProjectStatus status=ProjectStatus.OPEN;

    @Column(nullable = false)
    private String Domain;

    @Override
    public String toString() {
        return "Project{" +
                "projectId=" + projectId +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", budget=" + budget +
                ", client=" + clientId +
                '}';
    }
    public enum ProjectStatus{
        OPEN,
        CLOSED
    }
}
