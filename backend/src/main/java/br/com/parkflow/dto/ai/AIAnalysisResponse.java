package br.com.parkflow.dto.ai;

import br.com.parkflow.enums.AIAnalysisType;
import br.com.parkflow.enums.Priority;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AIAnalysisResponse(
    UUID id,
    AIAnalysisType analysisType,
    String provider,
    String model,
    BigDecimal confidenceScore,
    Priority severitySuggestion,
    String detectedPlate,
    String vehicleType,
    String evidence,
    String operationalRisk,
    Boolean plateDivergence,
    String summary,
    String nextStep,
    Boolean reviewed,
    OffsetDateTime createdAt
) {
}
