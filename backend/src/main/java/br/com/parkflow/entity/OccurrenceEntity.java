package br.com.parkflow.entity;

import br.com.parkflow.enums.OccurrenceStatus;
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
@Table(name = "occurrences")
public class OccurrenceEntity extends BaseEntity {

    @Column(nullable = false, unique = true, length = 30)
    private String occurrenceCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id")
    private VehicleEntity vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private UserEntity assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private UnitEntity unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private OccurrenceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private OccurrenceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Priority priority;

    @Column(nullable = false, length = 180)
    private String location;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private OffsetDateTime reportedAt;

    @Column(nullable = false)
    private OffsetDateTime stoppedSince;

    public String getOccurrenceCode() {
        return occurrenceCode;
    }

    public void setOccurrenceCode(String occurrenceCode) {
        this.occurrenceCode = occurrenceCode;
    }

    public VehicleEntity getVehicle() {
        return vehicle;
    }

    public void setVehicle(VehicleEntity vehicle) {
        this.vehicle = vehicle;
    }

    public UserEntity getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(UserEntity assignedTo) {
        this.assignedTo = assignedTo;
    }

    public UnitEntity getUnit() {
        return unit;
    }

    public void setUnit(UnitEntity unit) {
        this.unit = unit;
    }

    public OccurrenceType getType() {
        return type;
    }

    public void setType(OccurrenceType type) {
        this.type = type;
    }

    public OccurrenceStatus getStatus() {
        return status;
    }

    public void setStatus(OccurrenceStatus status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public OffsetDateTime getReportedAt() {
        return reportedAt;
    }

    public void setReportedAt(OffsetDateTime reportedAt) {
        this.reportedAt = reportedAt;
    }

    public OffsetDateTime getStoppedSince() {
        return stoppedSince;
    }

    public void setStoppedSince(OffsetDateTime stoppedSince) {
        this.stoppedSince = stoppedSince;
    }
}
