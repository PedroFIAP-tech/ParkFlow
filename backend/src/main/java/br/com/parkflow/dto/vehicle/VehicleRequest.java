package br.com.parkflow.dto.vehicle;

import jakarta.validation.constraints.NotBlank;

public record VehicleRequest(
    @NotBlank String plate,
    String chassis,
    String brand,
    String model,
    String color,
    Integer year,
    String ownerName
) {
}

