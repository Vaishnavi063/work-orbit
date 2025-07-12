package com.workorbit.backend.Service.contract;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContractResponse;
import com.workorbit.backend.DTO.CreateContractRequest;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Bids.bidStatus;
import com.workorbit.backend.Entity.Contract;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.BidRepository;
import com.workorbit.backend.Repository.ContractRepository;
import com.workorbit.backend.Repository.ProjectRepository;

import lombok.*;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {
	private final ContractRepository contractRepository;
	private final ProjectRepository projectRepository;
	private final BidRepository bidRepository;
	
	@Override
	public ApiResponse<ContractResponse> createContract(CreateContractRequest request) {
		Project project = projectRepository.findById(request.getProjectId())
						  .orElseThrow(() -> new RuntimeException("Project not found"));
		
		Bids bid = bidRepository.findById(request.getBidId())
				   .orElseThrow(() -> new RuntimeException("Bid not found"));
		
		if (bid.getStatus() == null || bidStatus.Accepted != bid.getStatus()) {
		        throw new RuntimeException("Only accepted bids can be used to create a contract.");
		}
		
		Contract contract = new Contract();
		contract.setProject(project);
		contract.setBid(bid);
		
		Contract savedContract = contractRepository.save(contract);
		
		return ApiResponse.success(toDTO(savedContract));
	}
	
	@Override
	public ApiResponse<List<ContractResponse>> getAllContracts(){
		List<Contract> contracts = contractRepository.findAll();

		List<ContractResponse> responseList = contracts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ApiResponse.success(responseList);
	}
	
	public ApiResponse<ContractResponse> getContractById(Long id) {
		Contract contract = contractRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Contract not found"));
		
		return ApiResponse.success(toDTO(contract));
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
