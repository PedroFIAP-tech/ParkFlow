package br.com.parkflow.dto.occurrence;

import br.com.parkflow.dto.ai.AIAnalysisResponse;
import br.com.parkflow.dto.vehicle.VehicleResponse;
import br.com.parkflow.enums.OccurrenceStatus;
import br.com.parkflow.enums.OccurrenceType;
import br.com.parkflow.enums.Priority;

import java.time.OffsetDateTime;
import java.util.UUID;

public record OccurrenceSummaryResponse(
    UUID id,
    String occurrenceCode,
    VehicleResponse vehicle,
    OccurrenceType type,
    OccurrenceStatus status,
    Priority priority,
    String location,
    long stoppedMinutes,
    AIAnalysisResponse latestAIAnalysis,
    OffsetDateTime updatedAt
) {
}

