package com.workorbit.backend.Service.contract;

import java.util.List;
import java.util.stream.Collectors;

import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Wallet.Service.WalletService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContractResponse;
import com.workorbit.backend.Entity.Bids;
import com.workorbit.backend.Entity.Contract;
import com.workorbit.backend.Entity.Project;
import com.workorbit.backend.Repository.ContractRepository;
import lombok.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

	private final ContractRepository contractRepository;
	private final WalletService walletService;

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
    public ApiResponse<ContractResponse> updateContract(Long id, String contractUpdatePayload) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(contractUpdatePayload);
            String contractStatus = node.has("contractStatus") ? node.get("contractStatus").asText() : null;
            Double freelancerRating = node.has("freelancerRating") && !node.get("freelancerRating").isNull() ? node.get("freelancerRating").asDouble() : null;

            if (contractStatus != null) {
                contract.setContractStatus(Contract.ContractStatus.valueOf(contractStatus));
            }
            if (freelancerRating != null) {
                contract.setFreelancerRating(freelancerRating);
            }

            Contract updated = contractRepository.save(contract);

            if (updated.getContractStatus() == Contract.ContractStatus.COMPLETED && freelancerRating != null) {
                // Update freelancer's average rating
                Freelancer freelancer = updated.getBid().getFreelancer();
                if (freelancer != null) {
                    Double oldAvg = freelancer.getRating() != null ? freelancer.getRating() : 0.0;
                    int ratingCount = 0;
                    if (freelancer.getRating() != null && freelancer.getRating() > 0.0) {
                        // Count previous ratings by counting completed contracts with a rating
                        ratingCount = (int) contractRepository.findAll().stream()
                            .filter(c -> c.getBid().getFreelancer().getId().equals(freelancer.getId()))
                            .filter(c -> c.getFreelancerRating() != null)
                            .count();
                    }
                    double newAvg = (oldAvg * ratingCount + freelancerRating) / (ratingCount + 1);
                    freelancer.setRating(newAvg);
                }
            }

            if (updated.getContractStatus() == Contract.ContractStatus.COMPLETED) {
                Long clientId = updated.getProject().getClient().getId();
                Long freelancerId = updated.getBid().getFreelancer().getId();
                Long projectId = updated.getProject().getId();
                Double amount = updated.getBid().getBidAmount();

                log.info("Releasing payment of {} from client {} to freelancer {} for project {} contract {}",
                        amount, clientId, freelancerId, projectId, updated.getContractId());

                walletService.releasePayment(clientId, freelancerId, projectId, amount);
            }

            return ApiResponse.success(toDTO(updated));
        } catch (Exception e) {
            throw new RuntimeException("Invalid contract update payload", e);
        }
    }
	
	@Override
	public ApiResponse<String> deleteContract(Long id) {
	    Contract contract = contractRepository.findById(id)
	        .orElseThrow(() -> new RuntimeException("Contract not found"));
	    contractRepository.delete(contract);
	    return ApiResponse.success("Contract deleted successfully");
	}
	
	private ContractResponse toDTO(Contract contract) {
        Project project = contract.getProject();
        Client client = project.getClient();
        String clientName = client != null ? client.getName() : "Unknown Client";
        Long clientId = client != null ? client.getId() : null;
        
        Freelancer freelancer = contract.getBid() != null ? contract.getBid().getFreelancer() : null;
        String freelancerName = freelancer != null ? freelancer.getName() : "Unknown Freelancer";
        Long freelancerId = freelancer != null ? freelancer.getId() : null;
        
        return ContractResponse.builder()
                .contractId(contract.getContractId())
                .projectId(project.getId())
                .projectName(project.getTitle())
                .clientId(clientId)
                .freelancerId(freelancerId)
                .clientName(clientName)
                .freelancerName(freelancerName)
                .bidId(contract.getBid().getId())
                .bidAmount(contract.getBid().getBidAmount())
                .contractStatus(contract.getContractStatus().name())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }
}
