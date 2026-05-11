package br.com.parkflow.service;

import br.com.parkflow.dto.vehicle.VehicleRequest;
import br.com.parkflow.dto.vehicle.VehicleResponse;
import br.com.parkflow.entity.VehicleEntity;
import br.com.parkflow.exception.ResourceNotFoundException;
import br.com.parkflow.mapper.ParkFlowMapper;
import br.com.parkflow.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ParkFlowMapper mapper;

    public VehicleService(VehicleRepository vehicleRepository, ParkFlowMapper mapper) {
        this.vehicleRepository = vehicleRepository;
        this.mapper = mapper;
    }

    @Transactional
    public VehicleEntity findOrCreate(VehicleRequest request) {
        var plate = normalizePlate(request.plate());
        return vehicleRepository.findByPlateIgnoreCase(plate)
            .map(vehicle -> updateVehicle(vehicle, request, plate))
            .orElseGet(() -> vehicleRepository.save(updateVehicle(new VehicleEntity(), request, plate)));
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> list() {
        return vehicleRepository.findAll().stream().map(mapper::toVehicleResponse).toList();
    }

    @Transactional(readOnly = true)
    public VehicleResponse findByPlate(String plate) {
        return vehicleRepository.findByPlateIgnoreCase(normalizePlate(plate))
            .map(mapper::toVehicleResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Veiculo nao encontrado."));
    }

    private VehicleEntity updateVehicle(VehicleEntity vehicle, VehicleRequest request, String plate) {
        vehicle.setPlate(plate);
        vehicle.setChassis(emptyToNull(request.chassis()));
        vehicle.setBrand(emptyToNull(request.brand()));
        vehicle.setModel(emptyToNull(request.model()));
        vehicle.setColor(emptyToNull(request.color()));
        vehicle.setYear(request.year());
        vehicle.setOwnerName(emptyToNull(request.ownerName()));
        return vehicle;
    }

    private String normalizePlate(String plate) {
        return plate == null ? null : plate.replace("-", "").trim().toUpperCase();
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

