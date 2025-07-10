package com.workorbit.backend.DTO;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Builder
public class ContractDTO {
	private Long contractId;
	private Long projectId;
	private Long bidId;
	private String contractStatus;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
