package br.com.parkflow.integration.ai;

import br.com.parkflow.entity.OccurrenceEntity;
import br.com.parkflow.entity.OccurrencePhotoEntity;
import br.com.parkflow.enums.Priority;
import br.com.parkflow.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.List;

@Component
public class OpenAiIncidentAnalysisClient {

    private static final String INSTRUCTIONS = """
        Voce e o modulo de inteligencia operacional do ParkFlow, uma plataforma B2B para sinistros e ocorrencias veiculares.
        Analise as informacoes e imagens como apoio ao operador, nunca como decisao definitiva.
        Responda em JSON estruturado. Seja objetivo, tecnico e operacional.
        Classifique gravidade em BAIXA, MEDIA, ALTA ou CRITICA.
        Se nao conseguir ler placa na imagem, retorne detected_plate como string vazia.
        Aponte divergencia quando a placa visual detectada for diferente da placa informada.
        """;

    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public OpenAiIncidentAnalysisClient(
        ObjectMapper objectMapper,
        @Value("${app.openai.api-key}") String apiKey,
        @Value("${app.openai.model}") String model
    ) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    public AIIncidentAnalysisResult analyze(OccurrenceEntity occurrence, List<OccurrencePhotoEntity> photos) {
        if (apiKey == null || apiKey.isBlank()) {
            return offlineAnalysis(occurrence, photos);
        }

        var restClient = RestClient.builder()
            .baseUrl("https://api.openai.com/v1")
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
            .build();

        try {
            var request = buildRequest(occurrence, photos);
            var response = restClient.post()
                .uri("/responses")
                .body(request)
                .retrieve()
                .body(String.class);

            var outputText = extractOutputText(response);
            var parsed = objectMapper.readTree(outputText);

            return new AIIncidentAnalysisResult(
                "OPENAI",
                model,
                decimal(parsed.path("confidence_score").asDouble(0)),
                priority(parsed.path("severity_suggestion").asText("MEDIA")),
                parsed.path("detected_plate").asText(""),
                parsed.path("plate_divergence").asBoolean(false),
                parsed.path("summary").asText(),
                parsed.path("next_step").asText(),
                outputText
            );
        } catch (RestClientException ex) {
            throw new BadRequestException("Falha ao consultar OpenAI: " + ex.getMessage());
        } catch (Exception ex) {
            throw new BadRequestException("Nao foi possivel interpretar a resposta da OpenAI.");
        }
    }

    private ObjectNode buildRequest(OccurrenceEntity occurrence, List<OccurrencePhotoEntity> photos) {
        var root = objectMapper.createObjectNode();
        root.put("model", model);
        root.put("instructions", INSTRUCTIONS);
        root.put("max_output_tokens", 1200);

        var input = root.putArray("input");
        var message = input.addObject();
        message.put("role", "user");
        var content = message.putArray("content");
        content.addObject()
            .put("type", "input_text")
            .put("text", occurrenceContext(occurrence, photos));

        photos.stream()
            .limit(6)
            .forEach(photo -> content.addObject()
                .put("type", "input_image")
                .put("image_url", photo.getUrl())
                .put("detail", "high"));

        var text = root.putObject("text");
        var format = text.putObject("format");
        format.put("type", "json_schema");
        format.put("name", "parkflow_occurrence_ai_analysis");
        format.put("strict", true);
        format.set("schema", schema());
        return root;
    }

    private String occurrenceContext(OccurrenceEntity occurrence, List<OccurrencePhotoEntity> photos) {
        return """
            Dados da ocorrencia:
            - Codigo: %s
            - Placa informada: %s
            - Chassi: %s
            - Tipo: %s
            - Status atual: %s
            - Prioridade atual: %s
            - Local: %s
            - Descricao: %s
            - Quantidade de fotos anexadas: %d

            Tarefas:
            1. Resumir a ocorrencia para um gestor operacional.
            2. Identificar danos visuais quando houver fotos.
            3. Sugerir gravidade operacional.
            4. Tentar ler a placa visualmente.
            5. Sugerir o proximo passo.
            6. Gerar eventos curtos para timeline automatica.
            """.formatted(
            occurrence.getOccurrenceCode(),
            occurrence.getVehicle().getPlate(),
            value(occurrence.getVehicle().getChassis()),
            occurrence.getType(),
            occurrence.getStatus(),
            occurrence.getPriority(),
            occurrence.getLocation(),
            value(occurrence.getDescription()),
            photos.size()
        );
    }

    private ObjectNode schema() {
        var schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        schema.put("additionalProperties", false);

        var properties = schema.putObject("properties");
        properties.putObject("summary").put("type", "string");
        properties.putObject("severity_suggestion")
            .put("type", "string")
            .putArray("enum").add("BAIXA").add("MEDIA").add("ALTA").add("CRITICA");
        properties.putObject("confidence_score").put("type", "number");
        properties.putObject("detected_plate").put("type", "string");
        properties.putObject("plate_divergence").put("type", "boolean");
        properties.putObject("next_step").put("type", "string");

        var damageFindings = properties.putObject("damage_findings");
        damageFindings.put("type", "array");
        var damageItem = damageFindings.putObject("items");
        damageItem.put("type", "object");
        damageItem.put("additionalProperties", false);
        var damageProps = damageItem.putObject("properties");
        damageProps.putObject("area").put("type", "string");
        damageProps.putObject("damage").put("type", "string");
        damageProps.putObject("severity").put("type", "string");
        damageItem.putArray("required").add("area").add("damage").add("severity");

        var timelineEvents = properties.putObject("timeline_events");
        timelineEvents.put("type", "array");
        var timelineItem = timelineEvents.putObject("items");
        timelineItem.put("type", "object");
        timelineItem.put("additionalProperties", false);
        var timelineProps = timelineItem.putObject("properties");
        timelineProps.putObject("title").put("type", "string");
        timelineProps.putObject("description").put("type", "string");
        timelineItem.putArray("required").add("title").add("description");

        schema.putArray("required")
            .add("summary")
            .add("severity_suggestion")
            .add("confidence_score")
            .add("detected_plate")
            .add("plate_divergence")
            .add("next_step")
            .add("damage_findings")
            .add("timeline_events");
        return schema;
    }

    private String extractOutputText(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        ArrayNode output = (ArrayNode) root.path("output");
        for (JsonNode item : output) {
            for (JsonNode content : item.path("content")) {
                if ("output_text".equals(content.path("type").asText())) {
                    return content.path("text").asText();
                }
            }
        }
        throw new IllegalStateException("Resposta sem output_text.");
    }

    private AIIncidentAnalysisResult offlineAnalysis(OccurrenceEntity occurrence, List<OccurrencePhotoEntity> photos) {
        var severity = photos.isEmpty() ? Priority.MEDIA : occurrence.getPriority();
        var summary = "Pre-analise local: ocorrencia " + occurrence.getOccurrenceCode()
            + " para placa " + occurrence.getVehicle().getPlate()
            + ", aguardando chave OPENAI_API_KEY para analise visual real.";
        var nextStep = photos.isEmpty()
            ? "Adicionar fotos do veiculo para habilitar triagem visual por IA."
            : "Configurar OPENAI_API_KEY e executar a analise inteligente novamente.";
        return AIIncidentAnalysisResult.offline(severity, summary, nextStep);
    }

    private Priority priority(String value) {
        try {
            return Priority.valueOf(value);
        } catch (RuntimeException ex) {
            return Priority.MEDIA;
        }
    }

    private BigDecimal decimal(double value) {
        return BigDecimal.valueOf(value).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private String value(String value) {
        return value == null || value.isBlank() ? "Nao informado" : value;
    }
}

