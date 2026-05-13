package br.com.parkflow.integration.ai;

import br.com.parkflow.enums.Priority;

import java.math.BigDecimal;

public record AIIncidentAnalysisResult(
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
    String rawJson
) {
    public static AIIncidentAnalysisResult offline(Priority severitySuggestion, String summary, String nextStep) {
        return new AIIncidentAnalysisResult(
            "OFFLINE_PREVIEW",
            "local-rule-preview",
            BigDecimal.valueOf(62.00),
            severitySuggestion,
            "",
            "Nao classificado",
            "Analise offline sem imagem processada pelo n8n.",
            "Risco calculado por prioridade e historico interno.",
            false,
            summary,
            nextStep,
            "{\"mode\":\"offline_preview\"}"
        );
    }
}
