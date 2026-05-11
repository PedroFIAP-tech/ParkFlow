package br.com.parkflow.dto.occurrence;

import br.com.parkflow.dto.vehicle.VehicleRequest;
import br.com.parkflow.enums.OccurrenceType;
import br.com.parkflow.enums.Priority;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OccurrenceCreateRequest(
    @Valid @NotNull VehicleRequest vehicle,
    @NotNull OccurrenceType type,
    Priority priority,
    @NotBlank String location,
    String description
) {
}

