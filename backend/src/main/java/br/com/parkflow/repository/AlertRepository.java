package br.com.parkflow.repository;

import br.com.parkflow.entity.AlertEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<AlertEntity, UUID> {
    List<AlertEntity> findByOccurrence_IdOrderByCreatedAtDesc(UUID occurrenceId);
}
