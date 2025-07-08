package com.workorbit.backend.DTO;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientDTO {
    private String name;
    private String email;
    private List<ProjectDTO> projects;
}
