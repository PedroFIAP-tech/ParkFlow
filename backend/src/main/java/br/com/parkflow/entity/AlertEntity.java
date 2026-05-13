package br.com.parkflow.entity;

import br.com.parkflow.enums.AlertType;
import br.com.parkflow.enums.OccurrenceType;
import br.com.parkflow.enums.Priority;
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
@Table(name = "alerts")
public class AlertEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "occurrence_id")
    private OccurrenceEntity occurrence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_occurrence_id")
    private OccurrenceEntity previousOccurrence;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id")
    private VehicleEntity vehicle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private AlertType type;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(length = 140)
    private String previousUnit;

    private OffsetDateTime previousDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 60)
    private OccurrenceType previousType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Priority riskLevel;

    private OffsetDateTime resolvedAt;

    public OccurrenceEntity getOccurrence() {
        return occurrence;
    }

    public void setOccurrence(OccurrenceEntity occurrence) {
        this.occurrence = occurrence;
    }

    public OccurrenceEntity getPreviousOccurrence() {
        return previousOccurrence;
    }

    public void setPreviousOccurrence(OccurrenceEntity previousOccurrence) {
        this.previousOccurrence = previousOccurrence;
    }

    public VehicleEntity getVehicle() {
        return vehicle;
    }

    public void setVehicle(VehicleEntity vehicle) {
        this.vehicle = vehicle;
    }

    public AlertType getType() {
        return type;
    }

    public void setType(AlertType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPreviousUnit() {
        return previousUnit;
    }

    public void setPreviousUnit(String previousUnit) {
        this.previousUnit = previousUnit;
    }

    public OffsetDateTime getPreviousDate() {
        return previousDate;
    }

    public void setPreviousDate(OffsetDateTime previousDate) {
        this.previousDate = previousDate;
    }

    public OccurrenceType getPreviousType() {
        return previousType;
    }

    public void setPreviousType(OccurrenceType previousType) {
        this.previousType = previousType;
    }

    public Priority getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(Priority riskLevel) {
        this.riskLevel = riskLevel;
    }

    public OffsetDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(OffsetDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
