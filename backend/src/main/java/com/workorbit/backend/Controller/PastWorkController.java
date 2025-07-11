package com.workorbit.backend.Controller;

import com.workorbit.backend.DTO.PastWorkDTO;
import com.workorbit.backend.Entity.PastWork;
import com.workorbit.backend.Service.pastWork.PastWorkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("freelancer/pastworks")
public class PastWorkController {

    @Autowired
    private PastWorkService pastWorkService;

    @PostMapping
    public ResponseEntity<PastWorkDTO> addPastWork(@RequestBody PastWorkDTO dto) {
        return new ResponseEntity<>(pastWorkService.addPastWork(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PastWork> updatePastWork(@PathVariable Long id, @RequestBody PastWorkDTO dto) {
        return ResponseEntity.ok(pastWorkService.updatePastWork(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePastWork(@PathVariable Long id) {
        pastWorkService.deletePastWork(id);
        return ResponseEntity.ok("Past work deleted.");
    }
}
