package br.com.parkflow.controller;

import br.com.parkflow.dto.occurrence.FileResponse;
import br.com.parkflow.dto.occurrence.OccurrenceCreateRequest;
import br.com.parkflow.dto.occurrence.OccurrenceDetailResponse;
import br.com.parkflow.dto.occurrence.OccurrencePriorityUpdateRequest;
import br.com.parkflow.dto.occurrence.OccurrenceStatusUpdateRequest;
import br.com.parkflow.dto.occurrence.OccurrenceSummaryResponse;
import br.com.parkflow.dto.occurrence.TimelineCreateRequest;
import br.com.parkflow.dto.occurrence.TimelineResponse;
import br.com.parkflow.service.OccurrenceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/occurrences")
public class OccurrenceController {

    private final OccurrenceService occurrenceService;

    public OccurrenceController(OccurrenceService occurrenceService) {
        this.occurrenceService = occurrenceService;
    }

    @GetMapping
    public List<OccurrenceSummaryResponse> list(@RequestParam(required = false) String search) {
        return occurrenceService.list(search);
    }

    @PostMapping
    public OccurrenceDetailResponse create(@Valid @RequestBody OccurrenceCreateRequest request) {
        return occurrenceService.create(request);
    }

    @GetMapping("/{id}")
    public OccurrenceDetailResponse detail(@PathVariable UUID id) {
        return occurrenceService.detail(id);
    }

    @PatchMapping("/{id}/status")
    public OccurrenceDetailResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody OccurrenceStatusUpdateRequest request) {
        return occurrenceService.updateStatus(id, request);
    }

    @PatchMapping("/{id}/priority")
    public OccurrenceDetailResponse updatePriority(@PathVariable UUID id, @Valid @RequestBody OccurrencePriorityUpdateRequest request) {
        return occurrenceService.updatePriority(id, request);
    }

    @PostMapping("/{id}/timeline")
    public TimelineResponse addTimeline(@PathVariable UUID id, @Valid @RequestBody TimelineCreateRequest request) {
        return occurrenceService.addTimeline(id, request);
    }

    @PostMapping("/{id}/photos")
    public FileResponse addPhoto(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        return occurrenceService.addPhoto(id, file);
    }

    @PostMapping("/{id}/documents")
    public FileResponse addDocument(
        @PathVariable UUID id,
        @RequestParam("file") MultipartFile file,
        @RequestParam(required = false) String documentType
    ) {
        return occurrenceService.addDocument(id, file, documentType);
    }
}
