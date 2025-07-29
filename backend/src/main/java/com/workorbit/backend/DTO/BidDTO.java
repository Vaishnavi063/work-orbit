package com.workorbit.backend.DTO;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Schema(description = "Bid data transfer object for creating new bids on projects")
public class BidDTO {
    
    @Schema(description = "ID of the freelancer submitting the bid", example = "1", required = true)
    @NotNull(message = "Freelancer ID cannot be null")
    private Long freelancerId;

    @Schema(description = "ID of the project being bid on", example = "1", required = true)
    @NotNull(message = "Project ID cannot be null")
    private Long projectId;

    @Schema(description = "Detailed proposal explaining how the freelancer will approach the project", 
            example = "I have 5+ years of experience in e-commerce development using React and Node.js. I can deliver a fully functional website with payment integration within the specified timeline.", 
            required = true)
    @NotBlank(message = "Proposal cannot be blank")
    private String proposal;

    @Schema(description = "Bid amount in dollars", example = "5000.00", required = true)
    @NotNull(message = "Bid amount cannot be null")
    @Positive(message = "Bid amount must be positive")
    private Double bidAmount;

    @Schema(description = "Estimated duration to complete the project in days", example = "30", required = true)
    @NotNull(message = "Duration cannot be null")
    @Positive(message = "Duration must be positive")
    private Long durationDays;

    @Schema(description = "Number of team members required for the project", example = "2", required = true)
    @NotNull(message = "Team size cannot be null")
    @Positive(message = "Team size must be positive")
    private Integer teamSize;
}
