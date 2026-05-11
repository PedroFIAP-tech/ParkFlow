package br.com.parkflow.service;

import br.com.parkflow.dto.report.OperationalOverviewResponse;
import br.com.parkflow.enums.OccurrenceStatus;
import br.com.parkflow.enums.Priority;
import br.com.parkflow.repository.OccurrenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final OccurrenceRepository occurrenceRepository;

    public ReportService(OccurrenceRepository occurrenceRepository) {
        this.occurrenceRepository = occurrenceRepository;
    }

    @Transactional(readOnly = true)
    public OperationalOverviewResponse operationalOverview() {
        return new OperationalOverviewResponse(
            occurrenceRepository.countByStatus(OccurrenceStatus.ABERTA),
            occurrenceRepository.countByPriority(Priority.CRITICA),
            occurrenceRepository.countByPriority(Priority.ALTA),
            occurrenceRepository.countByStatus(OccurrenceStatus.AGUARDANDO_VISTORIA),
            occurrenceRepository.countByStatus(OccurrenceStatus.EM_ANALISE)
        );
    }
}

