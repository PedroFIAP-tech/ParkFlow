package br.com.parkflow.dto.alert;

import br.com.parkflow.enums.OccurrenceType;
import br.com.parkflow.enums.Priority;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AlertResponse(
    UUID id,
    String title,
    String message,
    String plate,
    UUID previousOccurrenceId,
    String previousOccurrenceCode,
    String previousUnit,
    OffsetDateTime previousDate,
    OccurrenceType previousType,
    Priority riskLevel,
    OffsetDateTime createdAt
) {
}
