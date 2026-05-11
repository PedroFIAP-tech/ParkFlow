package br.com.parkflow.repository;

import br.com.parkflow.entity.OccurrenceDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OccurrenceDocumentRepository extends JpaRepository<OccurrenceDocumentEntity, UUID> {
    List<OccurrenceDocumentEntity> findByOccurrence_IdOrderByCreatedAtDesc(UUID occurrenceId);
}
