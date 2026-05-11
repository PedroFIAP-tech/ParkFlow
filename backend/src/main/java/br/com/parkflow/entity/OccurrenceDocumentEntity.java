package br.com.parkflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "occurrence_documents")
public class OccurrenceDocumentEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "occurrence_id")
    private OccurrenceEntity occurrence;

    @Column(nullable = false, columnDefinition = "text")
    private String url;

    @Column(length = 220)
    private String publicId;

    @Column(length = 180)
    private String originalFilename;

    @Column(length = 80)
    private String documentType;

    @Column(length = 80)
    private String contentType;

    private Long sizeBytes;

    @Column(columnDefinition = "text")
    private String ocrText;

    public OccurrenceEntity getOccurrence() {
        return occurrence;
    }

    public void setOccurrence(OccurrenceEntity occurrence) {
        this.occurrence = occurrence;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public String getOcrText() {
        return ocrText;
    }

    public void setOcrText(String ocrText) {
        this.ocrText = ocrText;
    }
}

