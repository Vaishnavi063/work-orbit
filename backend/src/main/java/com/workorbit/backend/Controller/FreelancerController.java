package com.workorbit.backend.Controller;
import com.workorbit.backend.DTO.ApiResponse;
import com.workorbit.backend.DTO.FreelancerDTO;
import com.workorbit.backend.Service.freelancer.FreelancerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/freelancers")
public class FreelancerController {

    @Autowired
    private FreelancerService freelancerService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FreelancerDTO>> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(freelancerService.getFreelancerProfile(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteFreelancer(@PathVariable Long id) {
        freelancerService.deleteFreelancer(id);
        return ResponseEntity.ok(ApiResponse.success("Freelancer deleted successfully."));
    }
}
