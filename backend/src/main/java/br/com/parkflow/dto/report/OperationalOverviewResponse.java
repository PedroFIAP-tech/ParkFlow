package br.com.parkflow.dto.report;

public record OperationalOverviewResponse(
    long openOccurrences,
    long criticalOccurrences,
    long highPriorityOccurrences,
    long activeAlerts,
    long inAnalysis
) {
}
