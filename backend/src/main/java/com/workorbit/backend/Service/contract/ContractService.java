package com.workorbit.backend.Service.contract;

import java.util.List;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContractResponse;

public interface ContractService {
	ApiResponse<ContractResponse> createContract(Long bidId);
	ApiResponse<List<ContractResponse>> getAllContracts();
	ApiResponse<ContractResponse> getContractById(Long id);
}
