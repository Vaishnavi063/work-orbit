package com.workorbit.backend.DTO;
import lombok.Data;
import java.util.List;

@Data
public class FreelancerUpdateDTO {
    private String name;
    private String email;
    private List<String> skills;
    private List<PastWorkUpdateDTO> pastWorks;
  }