package br.com.parkflow.service;

import br.com.parkflow.dto.ai.AIAnalysisResponse;
import br.com.parkflow.entity.AIAnalysisEntity;
import br.com.parkflow.enums.AIAnalysisType;
import br.com.parkflow.enums.TimelineEventType;
import br.com.parkflow.integration.ai.OpenAiIncidentAnalysisClient;
import br.com.parkflow.mapper.ParkFlowMapper;
import br.com.parkflow.repository.AIAnalysisRepository;
import br.com.parkflow.repository.OccurrencePhotoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AIAnalysisService {

    private final OccurrenceService occurrenceService;
    private final OccurrencePhotoRepository photoRepository;
    private final AIAnalysisRepository aiAnalysisRepository;
    private final OpenAiIncidentAnalysisClient aiClient;
    private final ParkFlowMapper mapper;

    public AIAnalysisService(
        OccurrenceService occurrenceService,
        OccurrencePhotoRepository photoRepository,
        AIAnalysisRepository aiAnalysisRepository,
        OpenAiIncidentAnalysisClient aiClient,
        ParkFlowMapper mapper
    ) {
        this.occurrenceService = occurrenceService;
        this.photoRepository = photoRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.aiClient = aiClient;
        this.mapper = mapper;
    }

    @Transactional
    public AIAnalysisResponse analyzeOccurrence(UUID occurrenceId) {
        var occurrence = occurrenceService.findEntity(occurrenceId);
        var photos = photoRepository.findByOccurrence_IdOrderByCreatedAtDesc(occurrenceId);
        var result = aiClient.analyze(occurrence, photos);

        var analysis = new AIAnalysisEntity();
        analysis.setOccurrence(occurrence);
        analysis.setPhoto(photos.stream().findFirst().orElse(null));
        analysis.setAnalysisType(AIAnalysisType.EVIDENCE_ANALYSIS);
        analysis.setProvider(result.provider());
        analysis.setModel(result.model());
        analysis.setConfidenceScore(result.confidenceScore());
        analysis.setSeveritySuggestion(result.severitySuggestion());
        analysis.setDetectedPlate(result.detectedPlate());
        analysis.setVehicleType(result.vehicleType());
        analysis.setEvidence(result.evidence());
        analysis.setOperationalRisk(result.operationalRisk());
        analysis.setPlateDivergence(result.plateDivergence());
        analysis.setSummary(result.summary());
        analysis.setNextStep(result.nextStep());
        analysis.setRawJson(result.rawJson());

        var saved = aiAnalysisRepository.save(analysis);
        photos.forEach(photo -> photo.setAiProcessed(true));

        occurrenceService.appendTimeline(
            occurrence,
            TimelineEventType.IA_ANALISOU,
            "Analise de evidencia concluida",
            result.summary(),
            occurrence.getStatus(),
            occurrence.getStatus()
        );
        return mapper.toAIAnalysisResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AIAnalysisResponse> listByOccurrence(UUID occurrenceId) {
        return aiAnalysisRepository.findByOccurrence_IdOrderByCreatedAtDesc(occurrenceId).stream()
            .map(mapper::toAIAnalysisResponse)
            .toList();
    }
}
