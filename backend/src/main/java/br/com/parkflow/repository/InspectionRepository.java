package br.com.parkflow.repository;

import br.com.parkflow.entity.InspectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InspectionRepository extends JpaRepository<InspectionEntity, UUID> {
}

