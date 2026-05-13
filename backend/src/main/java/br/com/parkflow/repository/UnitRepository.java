package br.com.parkflow.repository;

import br.com.parkflow.entity.UnitEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UnitRepository extends JpaRepository<UnitEntity, UUID> {
    Optional<UnitEntity> findByCodeIgnoreCase(String code);
}
