package com.workorbit.backend.DTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class BidDTO {
    @NotNull(message = "Freelancer ID cannot be null")
    private Long freelancerId;

    @NotNull(message = "Project ID cannot be null")
    private Long projectId;

    @NotBlank(message = "Proposal cannot be blank")
    private String proposal;

    @NotNull(message = "Bid amount cannot be null")
    @Positive(message = "Bid amount must be positive")
    private Double bidAmount;

    @NotNull(message = "Duration cannot be null")
    @Positive(message = "Duration must be positive")
    private Long durationDays;

    @NotNull(message = "Team size cannot be null")
    @Positive(message = "Team size must be positive")
    private Integer teamSize;
}
