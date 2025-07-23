package com.workorbit.backend.DTO;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Builder
public class ContractResponse {
	private Long contractId;
	private Long projectId;
	private String projectName;
	private String freelancerName;
	private Long clientId;
	private Long freelancerId;
	private String clientName;
	private Double bidAmount;
	private Long bidId;
	private String contractStatus;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
