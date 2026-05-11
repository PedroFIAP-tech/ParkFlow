package br.com.parkflow.dto.occurrence;

import br.com.parkflow.enums.Priority;
import jakarta.validation.constraints.NotNull;

public record OccurrencePriorityUpdateRequest(
    @NotNull Priority priority,
    String note
) {
}

