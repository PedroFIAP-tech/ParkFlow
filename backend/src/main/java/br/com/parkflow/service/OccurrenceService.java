package br.com.parkflow.service;

import br.com.parkflow.dto.ai.AIAnalysisResponse;
import br.com.parkflow.dto.occurrence.FileResponse;
import br.com.parkflow.dto.occurrence.OccurrenceCreateRequest;
import br.com.parkflow.dto.occurrence.OccurrenceDetailResponse;
import br.com.parkflow.dto.occurrence.OccurrencePriorityUpdateRequest;
import br.com.parkflow.dto.occurrence.OccurrenceStatusUpdateRequest;
import br.com.parkflow.dto.occurrence.OccurrenceSummaryResponse;
import br.com.parkflow.dto.occurrence.TimelineCreateRequest;
import br.com.parkflow.dto.occurrence.TimelineResponse;
import br.com.parkflow.entity.OccurrenceDocumentEntity;
import br.com.parkflow.entity.OccurrenceEntity;
import br.com.parkflow.entity.OccurrencePhotoEntity;
import br.com.parkflow.entity.OccurrenceTimelineEntity;
import br.com.parkflow.entity.UserEntity;
import br.com.parkflow.enums.OccurrenceStatus;
import br.com.parkflow.enums.Priority;
import br.com.parkflow.enums.TimelineEventType;
import br.com.parkflow.exception.ResourceNotFoundException;
import br.com.parkflow.integration.storage.CloudinaryStorageService;
import br.com.parkflow.mapper.ParkFlowMapper;
import br.com.parkflow.repository.AIAnalysisRepository;
import br.com.parkflow.repository.OccurrenceDocumentRepository;
import br.com.parkflow.repository.OccurrencePhotoRepository;
import br.com.parkflow.repository.OccurrenceRepository;
import br.com.parkflow.repository.OccurrenceTimelineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class OccurrenceService {

    private final OccurrenceRepository occurrenceRepository;
    private final OccurrenceTimelineRepository timelineRepository;
    private final OccurrencePhotoRepository photoRepository;
    private final OccurrenceDocumentRepository documentRepository;
    private final AIAnalysisRepository aiAnalysisRepository;
    private final VehicleService vehicleService;
    private final UserContextService userContextService;
    private final CloudinaryStorageService storageService;
    private final ParkFlowMapper mapper;

    public OccurrenceService(
        OccurrenceRepository occurrenceRepository,
        OccurrenceTimelineRepository timelineRepository,
        OccurrencePhotoRepository photoRepository,
        OccurrenceDocumentRepository documentRepository,
        AIAnalysisRepository aiAnalysisRepository,
        VehicleService vehicleService,
        UserContextService userContextService,
        CloudinaryStorageService storageService,
        ParkFlowMapper mapper
    ) {
        this.occurrenceRepository = occurrenceRepository;
        this.timelineRepository = timelineRepository;
        this.photoRepository = photoRepository;
        this.documentRepository = documentRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.vehicleService = vehicleService;
        this.userContextService = userContextService;
        this.storageService = storageService;
        this.mapper = mapper;
    }

    @Transactional
    public OccurrenceDetailResponse create(OccurrenceCreateRequest request) {
        var now = OffsetDateTime.now();
        var occurrence = new OccurrenceEntity();
        occurrence.setOccurrenceCode(nextOccurrenceCode());
        occurrence.setVehicle(vehicleService.findOrCreate(request.vehicle()));
        occurrence.setType(request.type());
        occurrence.setStatus(OccurrenceStatus.ABERTA);
        occurrence.setPriority(request.priority() == null ? Priority.MEDIA : request.priority());
        occurrence.setLocation(request.location().trim());
        occurrence.setDescription(request.description());
        occurrence.setReportedAt(now);
        occurrence.setStoppedSince(now);

        var saved = occurrenceRepository.save(occurrence);
        appendTimeline(saved, TimelineEventType.OCORRENCIA_CRIADA, "Ocorrencia aberta", "Registro criado na central operacional.", null, OccurrenceStatus.ABERTA);
        return detail(saved.getId());
    }

    @Transactional(readOnly = true)
    public List<OccurrenceSummaryResponse> list(String search) {
        var normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        return occurrenceRepository.searchOperationalQueue(normalizedSearch).stream()
            .sorted(Comparator
                .comparingInt((OccurrenceEntity occurrence) -> priorityRank(occurrence.getPriority()))
                .thenComparing(OccurrenceEntity::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::toSummary)
            .toList();
    }

    @Transactional(readOnly = true)
    public OccurrenceDetailResponse detail(UUID id) {
        var occurrence = findEntity(id);
        var photos = photoRepository.findByOccurrence_IdOrderByCreatedAtDesc(id).stream().map(mapper::toPhotoResponse).toList();
        var documents = documentRepository.findByOccurrence_IdOrderByCreatedAtDesc(id).stream().map(mapper::toDocumentResponse).toList();
        var timeline = timelineRepository.findByOccurrence_IdOrderByCreatedAtDesc(id).stream().map(mapper::toTimelineResponse).toList();
        var analyses = aiAnalysisRepository.findByOccurrence_IdOrderByCreatedAtDesc(id).stream().map(mapper::toAIAnalysisResponse).toList();

        return new OccurrenceDetailResponse(
            occurrence.getId(),
            occurrence.getOccurrenceCode(),
            mapper.toVehicleResponse(occurrence.getVehicle()),
            occurrence.getType(),
            occurrence.getStatus(),
            occurrence.getPriority(),
            occurrence.getLocation(),
            occurrence.getDescription(),
            stoppedMinutes(occurrence),
            photos,
            documents,
            timeline,
            analyses,
            occurrence.getReportedAt(),
            occurrence.getUpdatedAt()
        );
    }

    @Transactional
    public OccurrenceDetailResponse updateStatus(UUID id, OccurrenceStatusUpdateRequest request) {
        var occurrence = findEntity(id);
        var previous = occurrence.getStatus();
        occurrence.setStatus(request.status());
        occurrence.setStoppedSince(OffsetDateTime.now());
        appendTimeline(
            occurrence,
            TimelineEventType.STATUS_ALTERADO,
            "Status alterado para " + request.status().name(),
            request.note(),
            previous,
            request.status()
        );
        return detail(id);
    }

    @Transactional
    public OccurrenceDetailResponse updatePriority(UUID id, OccurrencePriorityUpdateRequest request) {
        var occurrence = findEntity(id);
        occurrence.setPriority(request.priority());
        appendTimeline(
            occurrence,
            TimelineEventType.PRIORIDADE_ALTERADA,
            "Prioridade alterada para " + request.priority().name(),
            request.note(),
            occurrence.getStatus(),
            occurrence.getStatus()
        );
        return detail(id);
    }

    @Transactional
    public TimelineResponse addTimeline(UUID id, TimelineCreateRequest request) {
        var occurrence = findEntity(id);
        var timeline = appendTimeline(occurrence, request.eventType(), request.title(), request.description(), occurrence.getStatus(), occurrence.getStatus());
        return mapper.toTimelineResponse(timeline);
    }

    @Transactional
    public FileResponse addPhoto(UUID occurrenceId, MultipartFile file) {
        var occurrence = findEntity(occurrenceId);
        var stored = storageService.upload(file, "parkflow/occurrences/" + occurrenceId + "/photos");
        var photo = new OccurrencePhotoEntity();
        photo.setOccurrence(occurrence);
        photo.setUrl(stored.url());
        photo.setPublicId(stored.publicId());
        photo.setOriginalFilename(stored.originalFilename());
        photo.setContentType(stored.contentType());
        photo.setSizeBytes(stored.sizeBytes());
        var saved = photoRepository.save(photo);
        appendTimeline(occurrence, TimelineEventType.FOTO_ADICIONADA, "Foto adicionada", stored.originalFilename(), occurrence.getStatus(), occurrence.getStatus());
        return mapper.toPhotoResponse(saved);
    }

    @Transactional
    public FileResponse addDocument(UUID occurrenceId, MultipartFile file, String documentType) {
        var occurrence = findEntity(occurrenceId);
        var stored = storageService.upload(file, "parkflow/occurrences/" + occurrenceId + "/documents");
        var document = new OccurrenceDocumentEntity();
        document.setOccurrence(occurrence);
        document.setUrl(stored.url());
        document.setPublicId(stored.publicId());
        document.setOriginalFilename(stored.originalFilename());
        document.setContentType(stored.contentType());
        document.setSizeBytes(stored.sizeBytes());
        document.setDocumentType(documentType);
        var saved = documentRepository.save(document);
        appendTimeline(occurrence, TimelineEventType.DOCUMENTO_ADICIONADO, "Documento adicionado", stored.originalFilename(), occurrence.getStatus(), occurrence.getStatus());
        return mapper.toDocumentResponse(saved);
    }

    public OccurrenceEntity findEntity(UUID id) {
        return occurrenceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ocorrencia nao encontrada."));
    }

    public OccurrenceTimelineEntity appendTimeline(
        OccurrenceEntity occurrence,
        TimelineEventType eventType,
        String title,
        String description,
        OccurrenceStatus previousStatus,
        OccurrenceStatus newStatus
    ) {
        UserEntity user = null;
        try {
            user = userContextService.currentUser();
        } catch (RuntimeException ignored) {
            // Eventos de sistema podem ser criados antes de um contexto autenticado existir.
        }
        var timeline = new OccurrenceTimelineEntity();
        timeline.setOccurrence(occurrence);
        timeline.setCreatedBy(user);
        timeline.setEventType(eventType);
        timeline.setTitle(title);
        timeline.setDescription(description);
        timeline.setPreviousStatus(previousStatus);
        timeline.setNewStatus(newStatus);
        return timelineRepository.save(timeline);
    }

    private OccurrenceSummaryResponse toSummary(OccurrenceEntity occurrence) {
        AIAnalysisResponse latestAI = aiAnalysisRepository.findFirstByOccurrence_IdOrderByCreatedAtDesc(occurrence.getId())
            .map(mapper::toAIAnalysisResponse)
            .orElse(null);

        return new OccurrenceSummaryResponse(
            occurrence.getId(),
            occurrence.getOccurrenceCode(),
            mapper.toVehicleResponse(occurrence.getVehicle()),
            occurrence.getType(),
            occurrence.getStatus(),
            occurrence.getPriority(),
            occurrence.getLocation(),
            stoppedMinutes(occurrence),
            latestAI,
            occurrence.getUpdatedAt()
        );
    }

    private long stoppedMinutes(OccurrenceEntity occurrence) {
        return Duration.between(occurrence.getStoppedSince(), OffsetDateTime.now()).toMinutes();
    }

    private String nextOccurrenceCode() {
        var year = OffsetDateTime.now().getYear();
        var sequence = occurrenceRepository.count() + 1;
        return "PF-" + year + "-" + String.format("%06d", sequence);
    }

    private int priorityRank(Priority priority) {
        return switch (priority) {
            case CRITICA -> 1;
            case ALTA -> 2;
            case MEDIA -> 3;
            case BAIXA -> 4;
        };
    }
}
