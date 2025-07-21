package com.workorbit.backend.DTO;
import lombok.Data;

@Data
public class PastWorkUpdateDTO {
    private Long id; // null for new
    private String title;
    private String link;
    private String description;
    private Boolean toDelete; // true if should be deleted
}