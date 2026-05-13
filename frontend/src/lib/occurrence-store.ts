import { mockDetail } from "@/lib/mock-data";
import type { ParkFlowAIResult } from "@/lib/ai-analysis";
import type { AIAnalysis, OccurrenceDetail, OccurrenceStatus, PlateAlert, Priority, TimelineEvent } from "@/types/parkflow";

const STORAGE_KEY = "parkflow_security_occurrences_v3";
const PLATE_ALERT_MESSAGE = "Atenção: veículo com histórico de suspeita registrado anteriormente.";

const seedIds = ["demo-1", "demo-2", "demo-3", "demo-4"];

export type NewOccurrenceInput = {
  plate: string;
  type: string;
  location: string;
  priority: Priority;
  description: string;
  photoUrl?: string;
  photoUrls?: string[];
  aiResult?: ParkFlowAIResult | null;
};

export type InspectionInput = {
  occurrenceId: string;
  observation: string;
  photoUrl?: string;
};

export function statusLabel(status: OccurrenceStatus) {
  const labels: Record<OccurrenceStatus, string> = {
    ABERTA: "Aberta",
    EM_ANALISE: "Em analise",
    ALERTA_GERADO: "Alerta gerado",
    MONITORAMENTO: "Monitoramento",
    RESOLVIDA: "Resolvida",
    CANCELADA: "Cancelada"
  };
  return labels[status];
}

export function typeLabel(type: string) {
  const labels: Record<string, string> = {
    PLACA_SUSPEITA: "Placa suspeita",
    ACESSO_NAO_AUTORIZADO: "Acesso nao autorizado",
    CONDUTA_SUSPEITA: "Conduta suspeita",
    INVASAO: "Invasao",
    COLISAO: "Colisao",
    VANDALISMO: "Vandalismo",
    DESACORDO_OPERACIONAL: "Desacordo operacional",
    EVASAO: "Evasao",
    FURTO_ROUBO: "Furto/roubo",
    DANO_PATRIMONIAL: "Dano patrimonial",
    OUTROS: "Outros"
  };
  return labels[type] ?? type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function priorityRank(priority: Priority) {
  return { CRITICA: 1, ALTA: 2, MEDIA: 3, BAIXA: 4 }[priority];
}

export function initialOccurrences(): OccurrenceDetail[] {
  const now = Date.now();
  const base = seedIds.map((id) => mockDetail(id));

  const resolvedHistory: OccurrenceDetail = {
    ...mockDetail("demo-4"),
    id: "demo-5",
    occurrenceCode: "PF-2026-000144",
    vehicle: {
      id: "veh-5",
      plate: "BRP4K21",
      brand: "Volkswagen",
      model: "Nivus Highline",
      color: "Azul"
    },
    type: "EVASAO",
    status: "RESOLVIDA",
    priority: "ALTA",
    location: "Unidade Pinheiros",
    stoppedMinutes: 0,
    updatedAt: new Date(now - 1000 * 60 * 38).toISOString(),
    reportedAt: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
    alerts: [],
    timeline: [
      event("tl-final-1", "STATUS_ALTERADO", "Ocorrencia resolvida", "Supervisor registrou abordagem e encerrou o monitoramento.", "Operacao ParkFlow", 38),
      event("tl-final-2", "EVIDENCIA_ADICIONADA", "Evidencia anexada", "Imagem da cancela vinculada ao historico da placa.", "Marina Costa", 55),
      event("tl-final-3", "OCORRENCIA_CRIADA", "Ocorrencia de seguranca aberta", "Registro criado pela central operacional.", "Rafael Lima", 60 * 28)
    ],
    latestAIAnalysis: {
      id: "ai-final-1",
      provider: "OPENAI",
      model: "gpt-5-mini",
      confidenceScore: 77,
      severitySuggestion: "ALTA",
      detectedPlate: "BRP4K21",
      plateDivergence: false,
      vehicleType: "SUV azul",
      evidence: "Imagem de saida sem validacao",
      operationalRisk: "Historico de evasao em unidade diferente",
      summary: "Placa registrada em evento de evasao anterior. Manter atencao em novas entradas da mesma placa.",
      nextStep: "Validar operador responsavel, preservar evidencias e manter historico por placa.",
      createdAt: new Date(now - 1000 * 60 * 50).toISOString()
    }
  };

  return [...base, resolvedHistory].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
}

export function loadOccurrences(): OccurrenceDetail[] {
  if (typeof window === "undefined") {
    return initialOccurrences();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seed = initialOccurrences();
    saveOccurrences(seed);
    return seed;
  }

  try {
    return JSON.parse(stored) as OccurrenceDetail[];
  } catch {
    const seed = initialOccurrences();
    saveOccurrences(seed);
    return seed;
  }
}

export function saveOccurrences(occurrences: OccurrenceDetail[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(occurrences));
}

export function createOccurrence(input: NewOccurrenceInput, current: OccurrenceDetail[]): OccurrenceDetail {
  const now = new Date();
  const sequence = String(149 + current.length).padStart(6, "0");
  const id = `demo-${crypto.randomUUID()}`;
  const plate = normalizePlate(input.plate);
  const history = getPlateHistory(current, plate);
  const alert = history[0] ? buildPlateAlert(plate, history[0]) : null;
  const ai = input.aiResult ? buildAIFromResult(plate, input.aiResult) : null;

  return {
    id,
    occurrenceCode: `PF-2026-${sequence}`,
    vehicle: {
      id: `veh-${crypto.randomUUID()}`,
      plate,
      brand: "Nao informado",
      model: "Veículo monitorado",
      color: "Nao informado"
    },
    type: input.type,
    status: alert ? "ALERTA_GERADO" : "ABERTA",
    priority: input.priority,
    location: input.location,
    description: input.description,
    stoppedMinutes: 0,
    updatedAt: now.toISOString(),
    reportedAt: now.toISOString(),
    latestAIAnalysis: ai,
    latestAlert: alert,
    aiAnalyses: ai ? [ai] : [],
    alerts: alert ? [alert] : [],
    photos: (input.photoUrls?.length ? input.photoUrls : input.photoUrl ? [input.photoUrl] : []).map((url, index) => ({
      id: `photo-${crypto.randomUUID()}`,
      url,
      originalFilename: `evidencia-seguranca-${index + 1}.jpg`
    })),
    documents: [],
    timeline: [
      ...(alert
        ? [
            event(
              `tl-${crypto.randomUUID()}`,
              "ALERTA_GERADO",
              "Alerta automatico de reincidencia",
              `${PLATE_ALERT_MESSAGE} Unidade anterior: ${alert.previousUnit}. Tipo: ${typeLabel(alert.previousType)}. Risco: ${alert.riskLevel}.`,
              "ParkFlow Security AI",
              0
            )
          ]
        : []),
      event(`tl-${crypto.randomUUID()}`, "OCORRENCIA_CRIADA", "Ocorrencia de seguranca aberta", "Registro criado na central operacional.", "Voce", 0),
      ...(input.photoUrl
        ? [
            event(`tl-${crypto.randomUUID()}`, "EVIDENCIA_ADICIONADA", "Evidencia visual adicionada", "Imagem anexada ao caso.", "Voce", 0)
          ]
        : []),
      ...(ai ? [event(`tl-${crypto.randomUUID()}`, "IA_ANALISOU", "Analise de evidencia concluida", ai.summary, "ParkFlow Security AI", 0)] : [])
    ]
  };
}

export function applyInspection(occurrences: OccurrenceDetail[], input: InspectionInput) {
  return occurrences.map((occurrence) => {
    if (occurrence.id !== input.occurrenceId) {
      return occurrence;
    }

    const updated: OccurrenceDetail = {
      ...occurrence,
      status: "EM_ANALISE",
      updatedAt: new Date().toISOString(),
      timeline: [
        event(`tl-${crypto.randomUUID()}`, "EVIDENCIA_ADICIONADA", "Evidencia operacional registrada", input.observation || "Nova evidencia registrada pelo operador.", "Voce", 0),
        ...occurrence.timeline
      ]
    };

    if (input.photoUrl) {
      updated.photos = [{ id: `photo-${crypto.randomUUID()}`, url: input.photoUrl, originalFilename: "evidencia-seguranca.jpg" }, ...updated.photos];
      updated.timeline = [
        event(`tl-${crypto.randomUUID()}`, "EVIDENCIA_ADICIONADA", "Imagem de evidencia adicionada", "Imagem anexada durante a analise operacional.", "Voce", 0),
        ...updated.timeline
      ];
    }

    return updated;
  });
}

export function addPhotoAndAI(occurrences: OccurrenceDetail[], occurrenceId: string, photoUrl: string) {
  return occurrences.map((occurrence) => {
    if (occurrence.id !== occurrenceId) {
      return occurrence;
    }

    const ai = buildAI(occurrence.vehicle.plate, occurrence.priority);
    return {
      ...occurrence,
      status: occurrence.status === "ABERTA" ? "EM_ANALISE" : occurrence.status,
      updatedAt: new Date().toISOString(),
      photos: [{ id: `photo-${crypto.randomUUID()}`, url: photoUrl, originalFilename: "evidencia-upload.jpg" }, ...occurrence.photos],
      aiAnalyses: [ai, ...occurrence.aiAnalyses],
      latestAIAnalysis: ai,
      timeline: [
        event(`tl-${crypto.randomUUID()}`, "IA_ANALISOU", "Analise de evidencia concluida", ai.summary, "ParkFlow Security AI", 0),
        event(`tl-${crypto.randomUUID()}`, "EVIDENCIA_ADICIONADA", "Evidencia adicionada", "Nova imagem vinculada a placa.", "Voce", 0),
        ...occurrence.timeline
      ]
    };
  });
}

export function setOccurrenceStatus(occurrences: OccurrenceDetail[], occurrenceId: string, status: OccurrenceStatus) {
  return occurrences.map((occurrence) =>
    occurrence.id === occurrenceId
      ? {
          ...occurrence,
          status,
          updatedAt: new Date().toISOString(),
          timeline: [
            event(`tl-${crypto.randomUUID()}`, "STATUS_ALTERADO", `Status alterado para ${statusLabel(status)}`, "Atualizacao feita pelo operador.", "Voce", 0),
            ...occurrence.timeline
          ]
        }
      : occurrence
  );
}

export function filterOccurrences(
  occurrences: OccurrenceDetail[],
  search: string,
  status: OccurrenceStatus | "TODOS",
  priority: Priority | "TODAS"
) {
  const term = search.trim().toLowerCase();
  return occurrences.filter((occurrence) => {
    const matchesSearch = term
      ? [occurrence.occurrenceCode, occurrence.vehicle.plate, occurrence.vehicle.chassis, occurrence.type, occurrence.location]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term))
      : true;
    const matchesStatus = status === "TODOS" || occurrence.status === status;
    const matchesPriority = priority === "TODAS" || occurrence.priority === priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });
}

export function getPlateHistory(occurrences: OccurrenceDetail[], plate: string, excludeId?: string) {
  const normalized = normalizePlate(plate);
  if (!normalized) {
    return [];
  }
  return occurrences
    .filter((occurrence) => occurrence.id !== excludeId && normalizePlate(occurrence.vehicle.plate) === normalized)
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
}

function buildAI(plate: string, priority: Priority): AIAnalysis {
  return {
    id: `ai-${crypto.randomUUID()}`,
    provider: "OPENAI_SIMULATED",
    model: "gpt-5-mini",
    confidenceScore: priority === "CRITICA" ? 91 : priority === "ALTA" ? 86 : 78,
    severitySuggestion: priority,
    detectedPlate: normalizePlate(plate),
    plateDivergence: false,
    vehicleType: "Veículo de passeio",
    evidence: "Placa visivel em imagem operacional",
    operationalRisk: "Risco calculado pelo nivel informado e historico da placa",
    summary: "Imagem analisada como evidencia de seguranca. A placa foi associada ao registro e deve permanecer na timeline.",
    nextStep: "Validar placa, unidade e decisao do supervisor antes de resolver.",
    createdAt: new Date().toISOString()
  };
}

function buildAIFromResult(plate: string, result: ParkFlowAIResult): AIAnalysis {
  return {
    id: `ai-${crypto.randomUUID()}`,
    provider: "N8N_OPENAI",
    model: "parkflow-security-webhook",
    confidenceScore: result.confidence,
    severitySuggestion: result.severity,
    vehicleType: result.vehicleType,
    evidence: result.evidence,
    operationalRisk: result.operationalRisk,
    detectedPlate: result.detectedPlate ?? normalizePlate(plate),
    plateDivergence: Boolean(result.detectedPlate && normalizePlate(result.detectedPlate) !== normalizePlate(plate)),
    summary: result.summary,
    nextStep: result.nextStep,
    createdAt: new Date().toISOString()
  };
}

function buildPlateAlert(plate: string, previous: OccurrenceDetail): PlateAlert {
  return {
    id: `alert-${crypto.randomUUID()}`,
    title: "Placa com historico de suspeita",
    message: PLATE_ALERT_MESSAGE,
    plate: normalizePlate(plate),
    previousOccurrenceId: previous.id,
    previousOccurrenceCode: previous.occurrenceCode,
    previousUnit: previous.location,
    previousDate: previous.reportedAt,
    previousType: previous.type,
    riskLevel: previous.priority,
    createdAt: new Date().toISOString()
  };
}

function event(id: string, eventType: string, title: string, description: string, createdBy: string, minutesAgo: number): TimelineEvent {
  return {
    id,
    eventType,
    title,
    description,
    createdBy,
    createdAt: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString()
  };
}

function normalizePlate(plate: string) {
  return plate.replace("-", "").trim().toUpperCase();
}
