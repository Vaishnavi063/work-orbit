package com.workorbit.backend.Entity;
import java.time.LocalDateTime;
import lombok.*;
import java.util.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Contract {
	@Id
	@GeneratedValue
	private long contractId;
	
	@ManyToOne
	@JoinColumn(name = "projectId")
	private Project project;
	
	@OneToOne
	@JoinColumn(name = "bidId")
	private Bids bid;
	
	
	private ContractStatus contractStatus = ContractStatus.IN_PROGRESS;
    
    public enum ContractStatus {
    	IN_PROGRESS,
    	COMPLETED
    }
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
