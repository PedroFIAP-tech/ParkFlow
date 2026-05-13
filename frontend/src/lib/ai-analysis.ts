import type { Priority } from "@/types/parkflow";

export type AIAnalysisStatus = "idle" | "loading" | "success" | "error";

export type ParkFlowAIResult = {
  plateVisible: string;
  vehicleType: string;
  evidence: string;
  operationalRisk: string;
  severity: Priority;
  summary: string;
  nextStep: string;
  confidence: number;
  detectedPlate?: string;
};

export type ParkFlowAIRequest = {
  occurrenceId: string;
  plate: string;
  description: string;
  image: File;
};

export type ParkFlowOCRRequest = {
  occurrenceId: string;
  image: File;
};

export type ParkFlowOCRResult = {
  plate: string;
  extractedText: string;
  model: string;
  document: string;
  confidence: number;
};

const ANALYZE_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_ANALYZE_WEBHOOK_URL ??
  "https://pedrosilvapriv.app.n8n.cloud/webhook/parkflow-analyze";

const OCR_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_OCR_WEBHOOK_URL ??
  "https://pedrosilvapriv.app.n8n.cloud/webhook/parkflow-ocr";

export async function requestParkFlowAI(payload: ParkFlowAIRequest): Promise<ParkFlowAIResult> {
  const formData = new FormData();
  formData.append("occurrenceId", payload.occurrenceId);
  formData.append("plate", payload.plate);
  formData.append("description", payload.description);
  formData.append("image", payload.image);

  const response = await fetch(ANALYZE_WEBHOOK_URL, {
    method: "POST",
    body: formData
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(readString(body, ["message", "error"]) || "Nao foi possivel analisar a imagem.");
  }

  return normalizeAIResult(body);
}

export async function requestParkFlowOCR(payload: ParkFlowOCRRequest): Promise<ParkFlowOCRResult> {
  const formData = new FormData();
  formData.append("occurrenceId", payload.occurrenceId);
  formData.append("image", payload.image);

  const response = await fetch(OCR_WEBHOOK_URL, {
    method: "POST",
    body: formData
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(readString(body, ["message", "error"]) || "Nao foi possivel executar OCR.");
  }

  return normalizeOCRResult(body);
}

export function normalizeAIResult(input: unknown): ParkFlowAIResult {
  const raw = unwrapResponse(input);
  const parsed = parseMaybeJson(raw);

  const severity = normalizeSeverity(readString(parsed, ["severity", "severidade", "gravidade", "priority"]));
  const confidence = normalizeConfidence(readUnknown(parsed, ["confidence", "confianca", "confidenceScore", "score"]));

  return {
    plateVisible: readString(parsed, ["plateVisible", "placaVisivel", "placa_visivel", "visiblePlate"]) || "Nao confirmado",
    vehicleType: readString(parsed, ["vehicleType", "tipoVeiculo", "tipo_veiculo", "model", "modelo"]) || "Veículo nao classificado",
    evidence:
      readString(parsed, ["evidence", "evidencia", "relevantEvidence", "evidenciaRelevante"]) ||
      readString(parsed, ["damageDetected", "danoDetectado", "detectedDamage"]) ||
      "Evidencia visual pendente de revisao humana",
    operationalRisk:
      readString(parsed, ["operationalRisk", "riscoOperacional", "risco_operacional", "risk"]) ||
      "Risco operacional calculado pela imagem e descricao",
    severity,
    summary:
      readString(parsed, ["summary", "resumo", "analysis", "analise"]) ||
      "A imagem foi analisada como evidencia operacional. Recomenda-se revisar placa, contexto e unidade antes do encerramento.",
    nextStep:
      readString(parsed, ["nextStep", "proximoPasso", "proximo_passo", "suggestedNextStep"]) ||
      "Validar leitura da placa, registrar decisao operacional e manter a timeline da placa atualizada.",
    confidence,
    detectedPlate: readString(parsed, ["detectedPlate", "placaDetectada", "plate", "placa"]) || undefined
  };
}

export function normalizeOCRResult(input: unknown): ParkFlowOCRResult {
  const raw = unwrapResponse(input);
  const parsed = parseMaybeJson(raw);

  return {
    plate: readString(parsed, ["plate", "placa", "detectedPlate", "placaDetectada"]) || "Nao identificada",
    extractedText: readString(parsed, ["extractedText", "textoExtraido", "text", "ocrText", "texto"]) || "Texto nao retornado pelo OCR.",
    model: readString(parsed, ["model", "modelo", "vehicleModel", "modeloVeiculo"]) || "Nao identificado",
    document: readString(parsed, ["document", "documento", "documentType", "tipoDocumento"]) || "Imagem/Documento",
    confidence: normalizeConfidence(readUnknown(parsed, ["confidence", "confianca", "confidenceScore", "score"]))
  };
}

function unwrapResponse(input: unknown): unknown {
  if (Array.isArray(input)) {
    return unwrapResponse(input[0]);
  }
  if (isRecord(input)) {
    if ("json" in input) {
      return unwrapResponse(input.json);
    }
    if ("data" in input) {
      return unwrapResponse(input.data);
    }
    if ("output" in input) {
      return unwrapResponse(input.output);
    }
    if ("result" in input) {
      return unwrapResponse(input.result);
    }
    if ("message" in input && isRecord(input.message) && "content" in input.message) {
      return unwrapResponse(input.message.content);
    }
  }
  return input;
}

function parseMaybeJson(input: unknown): unknown {
  if (typeof input !== "string") {
    return input;
  }
  const trimmed = input.trim();
  const jsonText = trimmed.match(/\{[\s\S]*\}/)?.[0] ?? trimmed;
  try {
    return JSON.parse(jsonText);
  } catch {
    return { summary: trimmed };
  }
}

function readString(input: unknown, keys: string[]) {
  const value = readUnknown(input, keys);
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}

function readUnknown(input: unknown, keys: string[]) {
  if (!isRecord(input)) {
    return undefined;
  }
  for (const key of keys) {
    if (key in input) {
      return input[key];
    }
  }
  return undefined;
}

function normalizeSeverity(value: string): Priority {
  const normalized = value.trim().toUpperCase();
  if (normalized.includes("CRIT")) {
    return "CRITICA";
  }
  if (normalized.includes("ALT") || normalized === "HIGH") {
    return "ALTA";
  }
  if (normalized.includes("BAIX") || normalized === "LOW") {
    return "BAIXA";
  }
  return "MEDIA";
}

function normalizeConfidence(value: unknown) {
  if (typeof value === "number") {
    return value <= 1 ? Math.round(value * 100) : Math.round(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace("%", "").replace(",", "."));
    if (Number.isFinite(parsed)) {
      return parsed <= 1 ? Math.round(parsed * 100) : Math.round(parsed);
    }
  }
  return 82;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
