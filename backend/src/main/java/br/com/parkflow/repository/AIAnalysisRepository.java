package br.com.parkflow.repository;

import br.com.parkflow.entity.AIAnalysisEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AIAnalysisRepository extends JpaRepository<AIAnalysisEntity, UUID> {
    List<AIAnalysisEntity> findByOccurrence_IdOrderByCreatedAtDesc(UUID occurrenceId);
    Optional<AIAnalysisEntity> findFirstByOccurrence_IdOrderByCreatedAtDesc(UUID occurrenceId);
}
