package br.com.parkflow.service;

import br.com.parkflow.dto.unit.UnitRequest;
import br.com.parkflow.dto.unit.UnitResponse;
import br.com.parkflow.entity.UnitEntity;
import br.com.parkflow.exception.ResourceNotFoundException;
import br.com.parkflow.mapper.ParkFlowMapper;
import br.com.parkflow.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UnitService {

    private final UnitRepository unitRepository;
    private final ParkFlowMapper mapper;

    public UnitService(UnitRepository unitRepository, ParkFlowMapper mapper) {
        this.unitRepository = unitRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<UnitResponse> list() {
        return unitRepository.findAll().stream().map(mapper::toUnitResponse).toList();
    }

    @Transactional
    public UnitResponse create(UnitRequest request) {
        var unit = new UnitEntity();
        unit.setName(request.name().trim());
        unit.setCode(request.code().trim().toUpperCase());
        unit.setType(request.type());
        unit.setContactName(emptyToNull(request.contactName()));
        unit.setPhone(emptyToNull(request.phone()));
        unit.setAddress(emptyToNull(request.address()));
        unit.setCity(emptyToNull(request.city()));
        return mapper.toUnitResponse(unitRepository.save(unit));
    }

    @Transactional(readOnly = true)
    public UnitEntity findEntity(UUID id) {
        return unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unidade nao encontrada."));
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
