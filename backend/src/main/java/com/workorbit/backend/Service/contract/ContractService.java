package com.workorbit.backend.Service.contract;

import java.util.List;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContractResponse;
import com.workorbit.backend.DTO.CreateContractRequest;

public interface ContractService {
	ApiResponse<ContractResponse> createContract(CreateContractRequest request);
	ApiResponse<List<ContractResponse>> getAllContracts();
	ApiResponse<ContractResponse> getContractById(Long id);
}
