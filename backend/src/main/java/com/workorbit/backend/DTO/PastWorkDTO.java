package com.workorbit.backend.DTO;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PastWorkDTO {
    private String title;
    private String link;
    private String description;
    private Long freelancerId;
}
