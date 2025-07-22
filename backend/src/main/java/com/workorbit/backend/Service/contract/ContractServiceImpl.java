package com.workorbit.backend.Service.contract;

import java.util.List;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContractResponse;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Contract;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.ContractRepository;
import lombok.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

	private final ContractRepository contractRepository;

	@Override
	public void createContract(Bids bid) {

	    log.info("Creating contract for bid ID: {}", bid.getId());

	    // Fetch the associated project from the bid
	    Project project = bid.getProject();
	    log.info("Project found: {}", project.getTitle());

	    if (project == null) {
			log.error("Project associated with the bid not found.");
	        throw new RuntimeException("Project associated with the bid not found.");
	    }

	    Contract contract = new Contract();
	    contract.setProject(project);
	    contract.setBid(bid);

	    Contract savedContract = contractRepository.save(contract);
		log.info("Contract saved: {}", savedContract.getContractId());
        toDTO(savedContract);
    }
	
	@Override
	public ApiResponse<List<ContractResponse>> getAllContracts(){
		List<Contract> contracts = contractRepository.findAll();
		log.info("Found {} contracts", contracts.size());
		List<ContractResponse> responseList = contracts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
		log.info("Contracts mapped: {}", responseList);
        return ApiResponse.success(responseList);
	}
	
	public ApiResponse<ContractResponse> getContractById(Long id) {
		Contract contract = contractRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Contract not found"));
		log.info("Contract found: {}", contract.getContractId());
		return ApiResponse.success(toDTO(contract));
	}
	
	@Override
	public ApiResponse<ContractResponse> updateContract(Long id, String contractStatus) {
	    Contract contract = contractRepository.findById(id)
	        .orElseThrow(() -> new RuntimeException("Contract not found"));
	    try {
	        contract.setContractStatus(Contract.ContractStatus.valueOf(contractStatus));
	    } catch (IllegalArgumentException e) {
	        throw new RuntimeException("Invalid contract status");
	    }
	    Contract updated = contractRepository.save(contract);
	    return ApiResponse.success(toDTO(updated));
	}
	
	@Override
	public ApiResponse<String> deleteContract(Long id) {
	    Contract contract = contractRepository.findById(id)
	        .orElseThrow(() -> new RuntimeException("Contract not found"));
	    contractRepository.delete(contract);
	    return ApiResponse.success("Contract deleted successfully");
	}
	
	private ContractResponse toDTO(Contract contract) {
        return ContractResponse.builder()
                .contractId(contract.getContractId())
                .projectId(contract.getProject().getId())
                .bidId(contract.getBid().getId())
                .contractStatus(contract.getContractStatus().name())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }
}
