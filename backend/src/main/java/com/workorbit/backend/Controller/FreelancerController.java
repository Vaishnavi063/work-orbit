package com.workorbit.backend.Controller;
import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.FreelancerDTO;
import com.workorbit.backend.DTO.FreelancerUpdateDTO;
import com.workorbit.backend.Service.freelancer.FreelancerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Tag(name = "Freelancers", description = "Freelancer profile management operations including profile retrieval, updates, and deletion")
@RestController
@RequestMapping("/api/freelancers")
@RequiredArgsConstructor
public class FreelancerController {

    private final FreelancerService freelancerService;

    @Operation(
        summary = "Get freelancer profile",
        description = "Retrieve detailed freelancer profile information including skills, rating, and past work history"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Freelancer profile retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Freelancer not found with the provided ID",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error occurred while retrieving freelancer profile",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FreelancerDTO>> getProfile(
        @Parameter(description = "Unique identifier of the freelancer", required = true, example = "1")
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(freelancerService.getFreelancerProfile(id)));
    }

    @Operation(
        summary = "Delete freelancer profile",
        description = "Permanently delete a freelancer profile and all associated data. Requires authentication and appropriate permissions."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Freelancer profile deleted successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Authentication required - valid JWT token must be provided",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Access forbidden - insufficient permissions to delete this freelancer profile",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Freelancer not found with the provided ID",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error occurred while deleting freelancer profile",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteFreelancer(
        @Parameter(description = "Unique identifier of the freelancer to delete", required = true, example = "1")
        @PathVariable Long id
    ) {
        freelancerService.deleteFreelancer(id);
        return ResponseEntity.ok(ApiResponse.success("Freelancer deleted successfully."));
    }

    @Operation(
        summary = "Update freelancer profile",
        description = "Update freelancer profile information including name, skills, and past work history. Requires authentication and appropriate permissions."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Freelancer profile updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request data - validation errors or malformed request body",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Authentication required - valid JWT token must be provided",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Access forbidden - insufficient permissions to update this freelancer profile",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Freelancer not found with the provided ID",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error occurred while updating freelancer profile",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FreelancerDTO>> updateFreelancer(
        @Parameter(description = "Unique identifier of the freelancer to update", required = true, example = "1")
        @PathVariable Long id,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Updated freelancer profile data including name, skills, and past work information",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = FreelancerUpdateDTO.class)
            )
        )
        @Valid @RequestBody FreelancerUpdateDTO dto
    ) {
        FreelancerDTO updated = freelancerService.updateFreelancerProfile(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
