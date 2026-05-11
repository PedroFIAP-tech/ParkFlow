package br.com.parkflow.repository;

import br.com.parkflow.entity.OccurrencePhotoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OccurrencePhotoRepository extends JpaRepository<OccurrencePhotoEntity, UUID> {
    List<OccurrencePhotoEntity> findByOccurrence_IdOrderByCreatedAtDesc(UUID occurrenceId);
}
