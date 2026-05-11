package br.com.parkflow.dto.vehicle;

import java.util.UUID;

public record VehicleResponse(
    UUID id,
    String plate,
    String chassis,
    String brand,
    String model,
    String color,
    Integer year,
    String ownerName
) {
}

