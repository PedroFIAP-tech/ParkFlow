import type { Priority } from "@/types/parkflow";

export type AIAnalysisStatus = "idle" | "loading" | "success" | "error";

export type ParkFlowAIResult = {
  damageDetected: string;
  damageType: string;
  severity: Priority;
  affectedParts: string[];
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

  const affected = readStringArray(parsed, ["affectedParts", "pecasAfetadas", "parts", "pecas_afetadas"]);
  const severity = normalizeSeverity(readString(parsed, ["severity", "severidade", "gravidade", "priority"]));
  const confidence = normalizeConfidence(readUnknown(parsed, ["confidence", "confianca", "confidenceScore", "score"]));

  return {
    damageDetected: readString(parsed, ["damageDetected", "danoDetectado", "dano_detectado", "detectedDamage"]) || "Dano visual identificado",
    damageType: readString(parsed, ["damageType", "tipoDano", "tipo_de_dano", "damage_category"]) || "Avaria externa",
    severity,
    affectedParts: affected.length ? affected : ["Parachoque", "Pintura", "Suporte"],
    summary:
      readString(parsed, ["summary", "resumo", "analysis", "analise"]) ||
      "A imagem apresenta sinais de avaria visual. Recomenda-se completar a vistoria antes do encaminhamento.",
    nextStep:
      readString(parsed, ["nextStep", "proximoPasso", "proximo_passo", "suggestedNextStep"]) ||
      "Iniciar vistoria tecnica, anexar fotos complementares e definir patio ou oficina.",
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

function readStringArray(input: unknown, keys: string[]) {
  const value = readUnknown(input, keys);
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
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
