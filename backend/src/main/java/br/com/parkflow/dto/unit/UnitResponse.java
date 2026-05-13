package br.com.parkflow.dto.unit;

import br.com.parkflow.enums.UnitType;

import java.util.UUID;

public record UnitResponse(
    UUID id,
    String name,
    String code,
    UnitType type,
    String contactName,
    String phone,
    String address,
    String city
) {
}
