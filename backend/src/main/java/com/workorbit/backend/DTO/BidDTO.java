package com.workorbit.backend.DTO;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class BidDTO {
    private Long freelancerId;
    private Long projectId;
    private String proposal;
    private Double bidAmount;
    private Long durationDays;
}
