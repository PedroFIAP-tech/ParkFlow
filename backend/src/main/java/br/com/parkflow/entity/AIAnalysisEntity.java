package br.com.parkflow.entity;

import br.com.parkflow.enums.AIAnalysisType;
import br.com.parkflow.enums.Priority;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ai_analyses")
public class AIAnalysisEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "occurrence_id")
    private OccurrenceEntity occurrence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id")
    private OccurrencePhotoEntity photo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private AIAnalysisType analysisType;

    @Column(nullable = false, length = 40)
    private String provider;

    @Column(nullable = false, length = 80)
    private String model;

    private BigDecimal confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Priority severitySuggestion;

    @Column(length = 12)
    private String detectedPlate;

    private Boolean plateDivergence;

    @Column(columnDefinition = "text")
    private String summary;

    @Column(columnDefinition = "text")
    private String nextStep;

    @Column(columnDefinition = "text")
    private String rawJson;

    @Column(nullable = false)
    private Boolean reviewed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private UserEntity reviewedBy;

    private OffsetDateTime reviewedAt;

    public OccurrenceEntity getOccurrence() {
        return occurrence;
    }

    public void setOccurrence(OccurrenceEntity occurrence) {
        this.occurrence = occurrence;
    }

    public OccurrencePhotoEntity getPhoto() {
        return photo;
    }

    public void setPhoto(OccurrencePhotoEntity photo) {
        this.photo = photo;
    }

    public AIAnalysisType getAnalysisType() {
        return analysisType;
    }

    public void setAnalysisType(AIAnalysisType analysisType) {
        this.analysisType = analysisType;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(BigDecimal confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Priority getSeveritySuggestion() {
        return severitySuggestion;
    }

    public void setSeveritySuggestion(Priority severitySuggestion) {
        this.severitySuggestion = severitySuggestion;
    }

    public String getDetectedPlate() {
        return detectedPlate;
    }

    public void setDetectedPlate(String detectedPlate) {
        this.detectedPlate = detectedPlate;
    }

    public Boolean getPlateDivergence() {
        return plateDivergence;
    }

    public void setPlateDivergence(Boolean plateDivergence) {
        this.plateDivergence = plateDivergence;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getNextStep() {
        return nextStep;
    }

    public void setNextStep(String nextStep) {
        this.nextStep = nextStep;
    }

    public String getRawJson() {
        return rawJson;
    }

    public void setRawJson(String rawJson) {
        this.rawJson = rawJson;
    }

    public Boolean getReviewed() {
        return reviewed;
    }

    public void setReviewed(Boolean reviewed) {
        this.reviewed = reviewed;
    }

    public UserEntity getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(UserEntity reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public OffsetDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(OffsetDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}

