package com.workorbit.backend.Controller;
import com.workorbit.backend.DTO.FreelancerDTO;
import com.workorbit.backend.Entity.Freelancer;
import com.workorbit.backend.Service.freelancer.FreelancerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/freelancers")
public class FreelancerController {

    @Autowired
    private FreelancerService freelancerService;

    @GetMapping("/{id}")
    public ResponseEntity<FreelancerDTO> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(freelancerService.getFreelancerProfile(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFreelancer(@PathVariable Long id) {
        freelancerService.deleteFreelancer(id);
        return ResponseEntity.ok("Freelancer deleted successfully.");
    }
}
