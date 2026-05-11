package br.com.parkflow.dto.occurrence;

import br.com.parkflow.enums.TimelineEventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TimelineCreateRequest(
    @NotNull TimelineEventType eventType,
    @NotBlank String title,
    String description
) {
}

