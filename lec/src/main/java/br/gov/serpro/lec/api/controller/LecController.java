package br.gov.serpro.lec.api.controller;

import br.gov.serpro.lec.api.dto.*;
import br.gov.serpro.lec.domain.model.StatusLec;
import br.gov.serpro.lec.domain.service.LecService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/lecs")
public class LecController {
    private final LecService lecService;

    public LecController(LecService lecService) {
        this.lecService = lecService;
    }

    @PostMapping
    public ResponseEntity<LecResponse> create(@Valid @RequestBody CreateLecRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lecService.create(request));
    }

    @GetMapping
    public List<LecResponse> findAll(@RequestParam(required = false) StatusLec status) {
        return lecService.findAll(status);
    }

    @GetMapping("/{id}")
    public LecResponse findById(@PathVariable UUID id) {
        return lecService.findById(id);
    }

    @PutMapping("/{id}")
    public LecResponse update(@PathVariable UUID id, @Valid @RequestBody LecRequest request) {
        return lecService.update(id, request);
    }

    @PutMapping("/{id}/classificacao")
    public ResponseEntity<Void> updateClassification(
            @PathVariable UUID id,
            @RequestBody ClassificationRequest classification) {
        lecService.updateClassification(id, classification);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    public LecResponse submit(@PathVariable UUID id) {
        return lecService.submit(id);
    }

    @PostMapping("/{id}/return")
    public LecResponse returnForChanges(
            @PathVariable UUID id,
            @Valid @RequestBody WorkflowDecisionRequest request) {
        return lecService.returnForChanges(id, request);
    }

    @PostMapping("/{id}/approve")
    public LecResponse approve(
            @PathVariable UUID id,
            @Valid @RequestBody WorkflowDecisionRequest request) {
        return lecService.approve(id, request);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lecService.addComment(id, request));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId) {
        lecService.deleteComment(id, commentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        lecService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
