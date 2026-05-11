package br.com.parkflow.controller;

import br.com.parkflow.dto.vehicle.VehicleResponse;
import br.com.parkflow.service.VehicleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public List<VehicleResponse> list() {
        return vehicleService.list();
    }

    @GetMapping("/by-plate/{plate}")
    public VehicleResponse findByPlate(@PathVariable String plate) {
        return vehicleService.findByPlate(plate);
    }
}

