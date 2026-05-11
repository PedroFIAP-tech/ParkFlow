package br.com.parkflow.dto.occurrence;

import br.com.parkflow.enums.OccurrenceStatus;
import br.com.parkflow.enums.TimelineEventType;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TimelineResponse(
    UUID id,
    TimelineEventType eventType,
    String title,
    String description,
    OccurrenceStatus previousStatus,
    OccurrenceStatus newStatus,
    String createdBy,
    OffsetDateTime createdAt
) {
}

