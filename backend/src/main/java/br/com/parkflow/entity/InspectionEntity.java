package br.com.parkflow.entity;

import br.com.parkflow.enums.InspectionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "inspections")
public class InspectionEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "occurrence_id")
    private OccurrenceEntity occurrence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspector_id")
    private UserEntity inspector;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private InspectionStatus status;

    @Column(columnDefinition = "text")
    private String notes;

    private OffsetDateTime scheduledAt;
    private OffsetDateTime completedAt;

    public OccurrenceEntity getOccurrence() {
        return occurrence;
    }

    public void setOccurrence(OccurrenceEntity occurrence) {
        this.occurrence = occurrence;
    }

    public UserEntity getInspector() {
        return inspector;
    }

    public void setInspector(UserEntity inspector) {
        this.inspector = inspector;
    }

    public InspectionStatus getStatus() {
        return status;
    }

    public void setStatus(InspectionStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public OffsetDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(OffsetDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(OffsetDateTime completedAt) {
        this.completedAt = completedAt;
    }
}

