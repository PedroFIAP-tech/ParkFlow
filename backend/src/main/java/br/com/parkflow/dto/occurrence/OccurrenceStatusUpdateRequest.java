package br.com.parkflow.dto.occurrence;

import br.com.parkflow.enums.OccurrenceStatus;
import jakarta.validation.constraints.NotNull;

public record OccurrenceStatusUpdateRequest(
    @NotNull OccurrenceStatus status,
    String note
) {
}

