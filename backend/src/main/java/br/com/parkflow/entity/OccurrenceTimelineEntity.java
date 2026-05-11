package br.com.parkflow.entity;

import br.com.parkflow.enums.OccurrenceStatus;
import br.com.parkflow.enums.TimelineEventType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "occurrence_timeline")
public class OccurrenceTimelineEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "occurrence_id")
    private OccurrenceEntity occurrence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private UserEntity createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private TimelineEventType eventType;

    @Column(nullable = false, length = 140)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 60)
    private OccurrenceStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 60)
    private OccurrenceStatus newStatus;

    public OccurrenceEntity getOccurrence() {
        return occurrence;
    }

    public void setOccurrence(OccurrenceEntity occurrence) {
        this.occurrence = occurrence;
    }

    public UserEntity getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserEntity createdBy) {
        this.createdBy = createdBy;
    }

    public TimelineEventType getEventType() {
        return eventType;
    }

    public void setEventType(TimelineEventType eventType) {
        this.eventType = eventType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public OccurrenceStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(OccurrenceStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public OccurrenceStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(OccurrenceStatus newStatus) {
        this.newStatus = newStatus;
    }
}

