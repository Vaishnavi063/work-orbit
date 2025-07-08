package com.workorbit.backend.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientCreateDTO {
    private String name;
    private String email;
    private String password;
}
