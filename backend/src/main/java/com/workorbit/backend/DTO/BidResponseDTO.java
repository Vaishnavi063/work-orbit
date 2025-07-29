package com.workorbit.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Bid response data transfer object containing complete bid information")
public class BidResponseDTO {
    
    @Schema(description = "Unique identifier for the bid", example = "1")
    private Long bidId;
    
    @Schema(description = "ID of the freelancer who submitted the bid", example = "1")
    private Long freelancerId;
    
    @Schema(description = "Complete project information that this bid is associated with")
    private ProjectDTO project;
    
    @Schema(description = "Name of the freelancer who submitted the bid", example = "John Doe")
    private String freelancerName;
    
    @Schema(description = "Detailed proposal explaining the freelancer's approach", 
            example = "I have 5+ years of experience in e-commerce development using React and Node.js. I can deliver a fully functional website with payment integration within the specified timeline.")
    private String proposal;
    
    @Schema(description = "Bid amount in dollars", example = "5000.00")
    private Double bidAmount;
    
    @Schema(description = "Estimated duration to complete the project in days", example = "30")
    private Long durationDays;
    
    @Schema(description = "Number of team members required for the project", example = "2")
    private Integer teamSize;
    
    @Schema(description = "Current status of the bid", example = "PENDING", allowableValues = {"PENDING", "ACCEPTED", "REJECTED"})
    private String status;
    
    @Schema(description = "Timestamp when the bid was created", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
}