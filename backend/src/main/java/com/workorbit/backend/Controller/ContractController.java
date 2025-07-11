package com.workorbit.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContractResponse;
import com.workorbit.backend.DTO.CreateContractRequest;
import com.workorbit.backend.Service.contract.ContractService;

import lombok.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contracts")
public class ContractController {
	private final ContractService contractService;
	
	@PostMapping
	public ResponseEntity<ApiResponse<ContractResponse>> createContract(@RequestBody CreateContractRequest request) {
		return ResponseEntity.ok(contractService.createContract(request));
	}
	
	@GetMapping
	public ResponseEntity<ApiResponse<List<ContractResponse>>> getAllContracts(){
		return ResponseEntity.ok(contractService.getAllContracts());
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ContractResponse>> getContractById(@PathVariable Long id){
		return ResponseEntity.ok(contractService.getContractById(id));
	}
	
}
