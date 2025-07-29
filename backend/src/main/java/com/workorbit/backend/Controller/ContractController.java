package com.workorbit.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.ContractResponse;
import com.workorbit.backend.Service.contract.ContractService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.*;

@Tag(name = "Contracts", description = "Contract management operations including retrieval, status updates, and deletion")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contracts")
public class ContractController {
	private final ContractService contractService;
	
	@Operation(
		summary = "Get all contracts",
		description = "Retrieve a list of all contracts in the system. Requires authentication."
	)
	@ApiResponses(value = {
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "200",
			description = "Contracts retrieved successfully",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "401",
			description = "Authentication required - user must be logged in",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "500",
			description = "Internal server error occurred while retrieving contracts",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		)
	})
	@SecurityRequirement(name = "bearerAuth")
	@GetMapping
	public ResponseEntity<ApiResponse<List<ContractResponse>>> getAllContracts(){
		return ResponseEntity.ok(contractService.getAllContracts());
	}
	
	@Operation(
		summary = "Get contract by ID",
		description = "Retrieve a specific contract by its unique identifier. Requires authentication."
	)
	@ApiResponses(value = {
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "200",
			description = "Contract retrieved successfully",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "401",
			description = "Authentication required - user must be logged in",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "404",
			description = "Contract not found - no contract exists with the provided ID",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "500",
			description = "Internal server error occurred while retrieving the contract",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		)
	})
	@SecurityRequirement(name = "bearerAuth")
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ContractResponse>> getContractById(
		@Parameter(
			description = "Unique identifier of the contract to retrieve",
			required = true,
			example = "1"
		)
		@PathVariable Long id
	){
		return ResponseEntity.ok(contractService.getContractById(id));
	}
	
	@Operation(
		summary = "Update contract status",
		description = "Update the status of a specific contract. Common statuses include 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING'. Requires authentication."
	)
	@ApiResponses(value = {
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "200",
			description = "Contract status updated successfully",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "400",
			description = "Invalid contract status provided or validation error",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "401",
			description = "Authentication required - user must be logged in",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "403",
			description = "Forbidden - user does not have permission to update this contract",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "404",
			description = "Contract not found - no contract exists with the provided ID",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "500",
			description = "Internal server error occurred while updating the contract",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		)
	})
	@SecurityRequirement(name = "bearerAuth")
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<ContractResponse>> updateContract(
		@Parameter(
			description = "Unique identifier of the contract to update",
			required = true,
			example = "1"
		)
		@PathVariable Long id,
		@Parameter(
			description = "New status for the contract (e.g., 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING')",
			required = true,
			example = "COMPLETED"
		)
		@RequestBody String contractStatus
	) {
	    return ResponseEntity.ok(contractService.updateContract(id, contractStatus));
	}

	@Operation(
		summary = "Delete contract",
		description = "Permanently delete a contract from the system. This action cannot be undone. Requires authentication and appropriate permissions."
	)
	@ApiResponses(value = {
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "200",
			description = "Contract deleted successfully",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "401",
			description = "Authentication required - user must be logged in",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "403",
			description = "Forbidden - user does not have permission to delete this contract",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "404",
			description = "Contract not found - no contract exists with the provided ID",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "409",
			description = "Conflict - contract cannot be deleted due to business constraints (e.g., active status)",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		),
		@io.swagger.v3.oas.annotations.responses.ApiResponse(
			responseCode = "500",
			description = "Internal server error occurred while deleting the contract",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(implementation = ApiResponse.class)
			)
		)
	})
	@SecurityRequirement(name = "bearerAuth")
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<String>> deleteContract(
		@Parameter(
			description = "Unique identifier of the contract to delete",
			required = true,
			example = "1"
		)
		@PathVariable Long id
	) {
	    return ResponseEntity.ok(contractService.deleteContract(id));
	}
	
}
