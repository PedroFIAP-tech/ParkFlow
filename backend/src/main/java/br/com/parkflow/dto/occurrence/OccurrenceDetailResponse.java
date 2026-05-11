package br.com.parkflow.dto.occurrence;

import br.com.parkflow.dto.ai.AIAnalysisResponse;
import br.com.parkflow.dto.vehicle.VehicleResponse;
import br.com.parkflow.enums.OccurrenceStatus;
import br.com.parkflow.enums.OccurrenceType;
import br.com.parkflow.enums.Priority;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OccurrenceDetailResponse(
    UUID id,
    String occurrenceCode,
    VehicleResponse vehicle,
    OccurrenceType type,
    OccurrenceStatus status,
    Priority priority,
    String location,
    String description,
    long stoppedMinutes,
    List<FileResponse> photos,
    List<FileResponse> documents,
    List<TimelineResponse> timeline,
    List<AIAnalysisResponse> aiAnalyses,
    OffsetDateTime reportedAt,
    OffsetDateTime updatedAt
) {
}

