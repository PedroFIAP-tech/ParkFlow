package br.com.parkflow.mapper;

import br.com.parkflow.dto.ai.AIAnalysisResponse;
import br.com.parkflow.dto.alert.AlertResponse;
import br.com.parkflow.dto.unit.UnitResponse;
import br.com.parkflow.entity.AlertEntity;
import br.com.parkflow.dto.occurrence.FileResponse;
import br.com.parkflow.dto.occurrence.TimelineResponse;
import br.com.parkflow.dto.user.UserResponse;
import br.com.parkflow.dto.vehicle.VehicleResponse;
import br.com.parkflow.entity.AIAnalysisEntity;
import br.com.parkflow.entity.OccurrenceDocumentEntity;
import br.com.parkflow.entity.OccurrencePhotoEntity;
import br.com.parkflow.entity.OccurrenceTimelineEntity;
import br.com.parkflow.entity.RoleEntity;
import br.com.parkflow.entity.UnitEntity;
import br.com.parkflow.entity.UserEntity;
import br.com.parkflow.entity.VehicleEntity;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ParkFlowMapper {

    public UserResponse toUserResponse(UserEntity user) {
        return new UserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRoles().stream().map(RoleEntity::getName).map(Enum::name).collect(Collectors.toSet())
        );
    }

    public VehicleResponse toVehicleResponse(VehicleEntity vehicle) {
        return new VehicleResponse(
            vehicle.getId(),
            vehicle.getPlate(),
            vehicle.getChassis(),
            vehicle.getBrand(),
            vehicle.getModel(),
            vehicle.getColor(),
            vehicle.getYear(),
            vehicle.getOwnerName()
        );
    }

    public UnitResponse toUnitResponse(UnitEntity unit) {
        return new UnitResponse(
            unit.getId(),
            unit.getName(),
            unit.getCode(),
            unit.getType(),
            unit.getContactName(),
            unit.getPhone(),
            unit.getAddress(),
            unit.getCity()
        );
    }

    public FileResponse toPhotoResponse(OccurrencePhotoEntity photo) {
        return new FileResponse(
            photo.getId(),
            photo.getUrl(),
            photo.getPublicId(),
            photo.getOriginalFilename(),
            photo.getContentType(),
            photo.getSizeBytes()
        );
    }

    public FileResponse toDocumentResponse(OccurrenceDocumentEntity document) {
        return new FileResponse(
            document.getId(),
            document.getUrl(),
            document.getPublicId(),
            document.getOriginalFilename(),
            document.getContentType(),
            document.getSizeBytes()
        );
    }

    public TimelineResponse toTimelineResponse(OccurrenceTimelineEntity timeline) {
        var author = timeline.getCreatedBy() == null ? "Sistema" : timeline.getCreatedBy().getFullName();
        return new TimelineResponse(
            timeline.getId(),
            timeline.getEventType(),
            timeline.getTitle(),
            timeline.getDescription(),
            timeline.getPreviousStatus(),
            timeline.getNewStatus(),
            author,
            timeline.getCreatedAt()
        );
    }

    public AIAnalysisResponse toAIAnalysisResponse(AIAnalysisEntity analysis) {
        return new AIAnalysisResponse(
            analysis.getId(),
            analysis.getAnalysisType(),
            analysis.getProvider(),
            analysis.getModel(),
            analysis.getConfidenceScore(),
            analysis.getSeveritySuggestion(),
            analysis.getDetectedPlate(),
            analysis.getVehicleType(),
            analysis.getEvidence(),
            analysis.getOperationalRisk(),
            analysis.getPlateDivergence(),
            analysis.getSummary(),
            analysis.getNextStep(),
            analysis.getReviewed(),
            analysis.getCreatedAt()
        );
    }

    public AlertResponse toAlertResponse(AlertEntity alert) {
        var previous = alert.getPreviousOccurrence();
        return new AlertResponse(
            alert.getId(),
            alert.getTitle(),
            alert.getMessage(),
            alert.getVehicle().getPlate(),
            previous == null ? null : previous.getId(),
            previous == null ? null : previous.getOccurrenceCode(),
            alert.getPreviousUnit(),
            alert.getPreviousDate(),
            alert.getPreviousType(),
            alert.getRiskLevel(),
            alert.getCreatedAt()
        );
    }
}
