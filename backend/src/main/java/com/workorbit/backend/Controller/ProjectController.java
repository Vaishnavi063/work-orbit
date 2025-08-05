package com.workorbit.backend.Controller;

import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.DTO.ProjectCountsResponse;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Service.project.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Projects", description = "Project management operations including creation, retrieval, updates, and bid management")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;

    @Operation(
        summary = "Create a new project",
        description = "Creates a new project with the provided details. Requires authentication."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Project created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid project data provided",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<com.workorbit.backend.DTO.ApiResponse<ProjectDTO>> createProject(
        @Parameter(description = "Project details to create", required = true)
        @RequestBody ProjectDTO dto
    ) {
        ProjectDTO created = projectService.createProject(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(com.workorbit.backend.DTO.ApiResponse.success(created));
    }

    @Operation(
        summary = "Get project counts by category",
        description = "Retrieves the count of active projects grouped by category. Public endpoint."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Project counts retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        )
    })
    @GetMapping("/counts-by-category")
    public ResponseEntity<com.workorbit.backend.DTO.ApiResponse<ProjectCountsResponse>> getProjectCountsByCategory() {
        ProjectCountsResponse counts = projectService.getProjectCountsByCategory();
        return ResponseEntity.ok(com.workorbit.backend.DTO.ApiResponse.success(counts));
    }

    @Operation(
        summary = "Get all projects",
        description = "Retrieves all projects with optional search functionality. Public endpoint."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Projects retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        )
    })
    @GetMapping
    public ResponseEntity<com.workorbit.backend.DTO.ApiResponse<List<ProjectDTO>>> getAllProjects(
            @RequestParam(value = "q", required = false) String query
    ) {
        List<ProjectDTO> projects = projectService.getAllProjects(query);
        return ResponseEntity.status(HttpStatus.OK).body(com.workorbit.backend.DTO.ApiResponse.success(projects));
    }


    @Operation(
        summary = "Get project by ID",
        description = "Retrieves a specific project by its unique identifier. Public endpoint."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Project retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Project not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<com.workorbit.backend.DTO.ApiResponse<ProjectDTO>> getProjectById(
        @Parameter(
            description = "Unique identifier of the project",
            required = true,
            example = "1"
        )
        @PathVariable Long id
    ) {
        try {
            ProjectDTO dto = projectService.getProjectById(id);
            return ResponseEntity.ok(com.workorbit.backend.DTO.ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(com.workorbit.backend.DTO.ApiResponse.error("Project not found"));
        }
    }

    @Operation(
        summary = "Get bids for a project",
        description = "Retrieves all bids submitted for a specific project. Requires authentication."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Bids retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Project not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/bid/{projectId}")
    public ResponseEntity<com.workorbit.backend.DTO.ApiResponse<List<BidResponseDTO>>> getBidsByProject(
        @Parameter(
            description = "Unique identifier of the project to get bids for",
            required = true,
            example = "1"
        )
        @PathVariable Long projectId
    ) {
        List<BidResponseDTO> bids = projectService.getBidsByProjectId(projectId);
        com.workorbit.backend.DTO.ApiResponse<List<BidResponseDTO>> response = com.workorbit.backend.DTO.ApiResponse.success(bids);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Update a project",
        description = "Updates an existing project with new details. Requires authentication and project ownership."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Project updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid project data provided",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions to update this project",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Project not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    public ResponseEntity<com.workorbit.backend.DTO.ApiResponse<ProjectDTO>> updateProject(
        @Parameter(
            description = "Unique identifier of the project to update",
            required = true,
            example = "1"
        )
        @PathVariable Long id,
        @Parameter(description = "Updated project details", required = true)
        @RequestBody ProjectDTO dto
    ) {
        ProjectDTO updatedProject = projectService.updateProject(id, dto);
        return ResponseEntity.ok(com.workorbit.backend.DTO.ApiResponse.success(updatedProject));
    }

    @Operation(
        summary = "Delete a project",
        description = "Deletes an existing project. Requires authentication and project ownership."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Project deleted successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions to delete this project",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Project not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{id}")
    public ResponseEntity<com.workorbit.backend.DTO.ApiResponse<String>> deleteProject(
        @Parameter(
            description = "Unique identifier of the project to delete",
            required = true,
            example = "1"
        )
        @PathVariable Long id
    ) {
        boolean deleted = projectService.deleteProjectById(id);
        if (deleted) {
            return ResponseEntity.ok(com.workorbit.backend.DTO.ApiResponse.success("Project deleted"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(com.workorbit.backend.DTO.ApiResponse.error("Project not found"));
        }
    }

    @Operation(
        summary = "Accept a bid for a project",
        description = "Accepts a specific bid for a project. Requires authentication and project ownership."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Bid accepted successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions to accept bids for this project",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Project or bid not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Bid cannot be accepted (already accepted/rejected or project status invalid)",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{projectId}/bids/{bidId}/accept")
    public ResponseEntity<com.workorbit.backend.DTO.ApiResponse<String>> acceptBid(
        @Parameter(
            description = "Unique identifier of the project",
            required = true,
            example = "1"
        )
        @PathVariable Long projectId,
        @Parameter(
            description = "Unique identifier of the bid to accept",
            required = true,
            example = "1"
        )
        @PathVariable Long bidId
    ) {
        projectService.acceptBid(projectId, bidId);
        return ResponseEntity.ok(com.workorbit.backend.DTO.ApiResponse.success("Project bid accepted"));
    }

    @Operation(
        summary = "Reject a bid for a project",
        description = "Rejects a specific bid for a project. Requires authentication and project ownership."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Bid rejected successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions to reject bids for this project",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Project or bid not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Bid cannot be rejected (already accepted/rejected)",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.workorbit.backend.DTO.ApiResponse.class)
            )
        )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{projectId}/bids/{bidId}/reject")
    public ResponseEntity<com.workorbit.backend.DTO.ApiResponse<String>> rejectBid(
        @Parameter(
            description = "Unique identifier of the project",
            required = true,
            example = "1"
        )
        @PathVariable Long projectId,
        @Parameter(
            description = "Unique identifier of the bid to reject",
            required = true,
            example = "1"
        )
        @PathVariable Long bidId
    ) {
        projectService.rejectBid(projectId, bidId);
        return ResponseEntity.ok(com.workorbit.backend.DTO.ApiResponse.success("Project rejected"));
    }
}