package br.com.parkflow.repository;

import br.com.parkflow.entity.OccurrenceEntity;
import br.com.parkflow.enums.OccurrenceStatus;
import br.com.parkflow.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OccurrenceRepository extends JpaRepository<OccurrenceEntity, UUID> {

    Optional<OccurrenceEntity> findByOccurrenceCodeIgnoreCase(String occurrenceCode);

    long countByStatus(OccurrenceStatus status);

    long countByPriority(Priority priority);

    @Query("""
        select o from OccurrenceEntity o
        join fetch o.vehicle v
        where (:search is null
            or lower(o.occurrenceCode) like lower(concat('%', :search, '%'))
            or lower(v.plate) like lower(concat('%', :search, '%'))
            or lower(coalesce(v.chassis, '')) like lower(concat('%', :search, '%')))
        order by o.updatedAt desc
        """)
    List<OccurrenceEntity> searchOperationalQueue(@Param("search") String search);
}
