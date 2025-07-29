package com.workorbit.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Client data transfer object containing client profile information and associated projects")
public class ClientDTO {
    
    @Schema(description = "Full name of the client", example = "Jane Doe", required = true)
    private String name;
    
    @Schema(description = "Email address of the client", example = "jane.doe@example.com", required = true)
    private String email;
    
    @Schema(description = "List of projects posted by this client")
    private List<ProjectDTO> projects;
}
