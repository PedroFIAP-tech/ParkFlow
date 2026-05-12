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
        var summary = "Preview operacional local: ocorrencia " + occurrence.getOccurrenceCode()
            + " para placa " + occurrence.getVehicle().getPlate()
            + ". A IA real do ParkFlow esta integrada pelos workflows n8n no frontend.";
        var nextStep = photos.isEmpty()
            ? "Selecionar uma imagem no frontend para executar IA/OCR via n8n."
            : "Usar o fluxo n8n do frontend para analise real da imagem.";
        return AIIncidentAnalysisResult.offline(severity, summary, nextStep);
    }
}
