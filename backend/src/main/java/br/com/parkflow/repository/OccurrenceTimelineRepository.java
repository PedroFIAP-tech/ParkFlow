package br.com.parkflow.repository;

import br.com.parkflow.entity.OccurrenceTimelineEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OccurrenceTimelineRepository extends JpaRepository<OccurrenceTimelineEntity, UUID> {
    List<OccurrenceTimelineEntity> findByOccurrence_IdOrderByCreatedAtDesc(UUID occurrenceId);
}
