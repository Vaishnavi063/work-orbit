package com.workorbit.backend.DTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Builder
@Schema(description = "Contract response containing complete contract information with project and participant details")
public class ContractResponse {
	
	@Schema(description = "Unique identifier for the contract", example = "1")
	private Long contractId;
	
	@Schema(description = "ID of the associated project", example = "1")
	private Long projectId;
	
	@Schema(description = "Name/title of the associated project", example = "E-commerce Website Development")
	private String projectName;
	
	@Schema(description = "Name of the freelancer assigned to the contract", example = "John Smith")
	private String freelancerName;
	
	@Schema(description = "ID of the client who owns the project", example = "1")
	private Long clientId;
	
	@Schema(description = "ID of the freelancer assigned to the contract", example = "2")
	private Long freelancerId;
	
	@Schema(description = "Name of the client who owns the project", example = "Jane Doe")
	private String clientName;
	
	@Schema(description = "Agreed bid amount for the contract in dollars", example = "5000.00")
	private Double bidAmount;
	
	@Schema(description = "ID of the winning bid that created this contract", example = "1")
	private Long bidId;
	
	@Schema(description = "Current status of the contract", 
			example = "IN_PROGRESS", 
			allowableValues = {"IN_PROGRESS", "COMPLETED"})
	private String contractStatus;
	
	@Schema(description = "Timestamp when the contract was created", example = "2024-01-15T10:30:00")
	private LocalDateTime createdAt;
	
	@Schema(description = "Timestamp when the contract was last updated", example = "2024-01-16T14:20:00")
	private LocalDateTime updatedAt;
	
	@Schema(description = "Rating given to the freelancer upon contract completion (1.0 to 5.0)", 
			example = "4.5", 
			minimum = "1.0", 
			maximum = "5.0")
	private Double freelancerRating;
}
