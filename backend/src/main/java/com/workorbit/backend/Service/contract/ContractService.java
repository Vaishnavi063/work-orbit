package com.workorbit.backend.Service.contract;

import java.util.List;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContractResponse;
import com.workorbit.backend.Entity.Bids;

public interface ContractService {
	Long createContract(Bids bid);
	ApiResponse<List<ContractResponse>> getAllContracts();
	ApiResponse<ContractResponse> getContractById(Long id);
	ApiResponse<ContractResponse> updateContract(Long id, String contractStatus);
	ApiResponse<String> deleteContract(Long id);
}
