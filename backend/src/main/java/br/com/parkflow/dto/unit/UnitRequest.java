package br.com.parkflow.dto.unit;

import br.com.parkflow.enums.UnitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UnitRequest(
    @NotBlank String name,
    @NotBlank String code,
    @NotNull UnitType type,
    String contactName,
    String phone,
    String address,
    String city
) {
}
