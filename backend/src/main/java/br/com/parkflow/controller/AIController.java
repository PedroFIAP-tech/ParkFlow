package br.com.parkflow.controller;

import br.com.parkflow.dto.ai.AIAnalysisResponse;
import br.com.parkflow.service.AIAnalysisService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIAnalysisService aiAnalysisService;

    public AIController(AIAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }

    @PostMapping("/occurrences/{id}/analyze")
    public AIAnalysisResponse analyzeOccurrence(@PathVariable UUID id) {
        return aiAnalysisService.analyzeOccurrence(id);
    }

    @GetMapping("/occurrences/{id}/analyses")
    public List<AIAnalysisResponse> listAnalyses(@PathVariable UUID id) {
        return aiAnalysisService.listByOccurrence(id);
    }
}
