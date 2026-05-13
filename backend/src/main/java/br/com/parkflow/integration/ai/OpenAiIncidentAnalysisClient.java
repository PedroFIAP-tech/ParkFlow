package br.com.parkflow.integration.ai;

import br.com.parkflow.entity.OccurrenceEntity;
import br.com.parkflow.entity.OccurrencePhotoEntity;
import br.com.parkflow.enums.Priority;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OpenAiIncidentAnalysisClient {

    public AIIncidentAnalysisResult analyze(OccurrenceEntity occurrence, List<OccurrencePhotoEntity> photos) {
        return offlineAnalysis(occurrence, photos);
    }

    private AIIncidentAnalysisResult offlineAnalysis(OccurrenceEntity occurrence, List<OccurrencePhotoEntity> photos) {
        var severity = photos.isEmpty() ? Priority.MEDIA : occurrence.getPriority();
        var summary = "Preview de seguranca local: ocorrencia " + occurrence.getOccurrenceCode()
            + " para placa " + occurrence.getVehicle().getPlate()
            + ". A IA real do ParkFlow esta integrada pelos workflows n8n para leitura de placa e evidencia.";
        var nextStep = photos.isEmpty()
            ? "Selecionar uma imagem no frontend para executar analise de evidencia via n8n."
            : "Usar o fluxo n8n do frontend para analise real da imagem, placa e risco operacional.";
        return AIIncidentAnalysisResult.offline(severity, summary, nextStep);
    }
}
