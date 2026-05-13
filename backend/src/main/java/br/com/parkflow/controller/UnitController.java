package br.com.parkflow.controller;

import br.com.parkflow.dto.unit.UnitRequest;
import br.com.parkflow.dto.unit.UnitResponse;
import br.com.parkflow.service.UnitService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/units")
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @GetMapping
    public List<UnitResponse> list() {
        return unitService.list();
    }

    @PostMapping
    public UnitResponse create(@Valid @RequestBody UnitRequest request) {
        return unitService.create(request);
    }
}
