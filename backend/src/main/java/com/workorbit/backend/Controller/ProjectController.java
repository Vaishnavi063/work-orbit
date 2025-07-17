package com.workorbit.backend.Controller;

import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.BidResponseDTO;
import com.workorbit.backend.DTO.ProjectDTO;
import com.workorbit.backend.Service.project.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects")
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDTO>> createProject(@RequestBody ProjectDTO dto) {
        ProjectDTO created = projectService.createProject(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getAllProjects() {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(projectService.getAllProjects()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDTO>> getProjectById(@PathVariable Long id) {
        try {
            ProjectDTO dto = projectService.getProjectById(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Project not found"));

        }
    }

    @GetMapping("/bid/{projectId}")
    public ResponseEntity<ApiResponse<List<BidResponseDTO>>> getBidsByProject(@PathVariable Long projectId) {
        List<BidResponseDTO> bids = projectService.getBidsByProjectId(projectId);
        ApiResponse<List<BidResponseDTO>> response = ApiResponse.success(bids);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDTO>> updateProject(@PathVariable Long id, @RequestBody ProjectDTO dto) {
        ProjectDTO updatedProject = projectService.updateProject(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updatedProject));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProject(@PathVariable Long id) {
        boolean deleted = projectService.deleteProjectById(id);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("Project deleted"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Project not found"));
        }
    }

    @PutMapping("/{projectId}/bids/{bidId}/accept")
    public ResponseEntity<ApiResponse<String>> acceptBid(
            @PathVariable Long projectId,
            @PathVariable Long bidId) {

        projectService.acceptBid(projectId, bidId);
        return ResponseEntity.ok(ApiResponse.success("Project bid accepted"));
    }

    @PutMapping("/{projectId}/bids/{bidId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectBid(@PathVariable Long projectId, @PathVariable Long bidId) {
        projectService.rejectBid(projectId,bidId);
        return ResponseEntity.ok(ApiResponse.success("Project rejected"));
    }
}
