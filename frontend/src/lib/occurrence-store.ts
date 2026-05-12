import { mockDetail } from "@/lib/mock-data";
import type { ParkFlowAIResult } from "@/lib/ai-analysis";
import type { AIAnalysis, OccurrenceDetail, OccurrenceStatus, Priority, TimelineEvent } from "@/types/parkflow";

const STORAGE_KEY = "parkflow_occurrences_v2";

const seedIds = ["demo-1", "demo-2", "demo-3", "demo-4"];

export type NewOccurrenceInput = {
  plate: string;
  type: string;
  location: string;
  priority: Priority;
  description: string;
  photoUrl?: string;
  aiResult?: ParkFlowAIResult | null;
};

export type InspectionInput = {
  occurrenceId: string;
  observation: string;
  photoUrl?: string;
};

export function statusLabel(status: OccurrenceStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function priorityRank(priority: Priority) {
  return { CRITICA: 1, ALTA: 2, MEDIA: 3, BAIXA: 4 }[priority];
}

export function initialOccurrences(): OccurrenceDetail[] {
  const now = Date.now();
  const base = seedIds.map((id) => mockDetail(id));

  const finalized: OccurrenceDetail = {
    ...mockDetail("demo-4"),
    id: "demo-5",
    occurrenceCode: "PF-2026-000144",
    vehicle: {
      id: "veh-5",
      plate: "FNL8D22",
      brand: "Honda",
      model: "Civic",
      color: "Cinza"
    },
    type: "AVARIA",
    status: "FINALIZADA",
    priority: "BAIXA",
    location: "Patio Oeste",
    stoppedMinutes: 0,
    updatedAt: new Date(now - 1000 * 60 * 38).toISOString(),
    reportedAt: new Date(now - 1000 * 60 * 260).toISOString(),
    timeline: [
      event("tl-final-1", "STATUS_ALTERADO", "Ocorrencia finalizada", "Vistoria concluida e veiculo liberado.", "Operacao ParkFlow", 38),
      event("tl-final-2", "VISTORIA_FINALIZADA", "Vistoria finalizada", "Checklist tecnico anexado ao registro.", "Marina Costa", 55),
      event("tl-final-3", "OCORRENCIA_CRIADA", "Ocorrencia aberta", "Registro criado pela central operacional.", "Rafael Lima", 260)
    ],
    latestAIAnalysis: {
      id: "ai-final-1",
      provider: "OPENAI",
      model: "gpt-5-mini",
      confidenceScore: 77,
      severitySuggestion: "BAIXA",
      detectedPlate: "FNL8D22",
      plateDivergence: false,
      summary: "Avaria superficial, sem indicio de dano estrutural. Caso elegivel para encerramento rapido.",
      nextStep: "Registrar liberacao e arquivar fotos finais.",
      createdAt: new Date(now - 1000 * 60 * 50).toISOString()
    }
  };

  return [...base, finalized].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
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
  const ai = input.aiResult ? buildAIFromResult(input.plate, input.aiResult) : null;

  return {
    id,
    occurrenceCode: `PF-2026-${sequence}`,
    vehicle: {
      id: `veh-${crypto.randomUUID()}`,
      plate: normalizePlate(input.plate),
      brand: "Nao informado",
      model: "Veiculo em triagem",
      color: "Nao informado"
    },
    type: input.type,
    status: "ABERTA",
    priority: input.priority,
    location: input.location,
    description: input.description,
    stoppedMinutes: 0,
    updatedAt: now.toISOString(),
    reportedAt: now.toISOString(),
    latestAIAnalysis: ai,
    aiAnalyses: ai ? [ai] : [],
    photos: input.photoUrl
      ? [{ id: `photo-${crypto.randomUUID()}`, url: input.photoUrl, originalFilename: "foto-vistoria.jpg" }]
      : [],
    documents: [],
    timeline: [
      event(`tl-${crypto.randomUUID()}`, "OCORRENCIA_CRIADA", "Ocorrencia aberta", "Registro criado pela central operacional.", "Voce", 0),
      ...(input.photoUrl
        ? [
            event(`tl-${crypto.randomUUID()}`, "FOTO_ADICIONADA", "Foto adicionada", "Evidencia visual anexada ao caso.", "Voce", 0)
          ]
        : []),
      ...(ai ? [event(`tl-${crypto.randomUUID()}`, "IA_ANALISOU", "Analise inteligente concluida", ai.summary, "ParkFlow AI", 0)] : [])
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
        event(`tl-${crypto.randomUUID()}`, "VISTORIA_INICIADA", "Vistoria iniciada", input.observation || "Vistoria aberta pelo operador.", "Voce", 0),
        ...occurrence.timeline
      ]
    };

    if (input.photoUrl) {
      updated.photos = [{ id: `photo-${crypto.randomUUID()}`, url: input.photoUrl, originalFilename: "foto-vistoria.jpg" }, ...updated.photos];
      updated.timeline = [
        event(`tl-${crypto.randomUUID()}`, "FOTO_ADICIONADA", "Foto de vistoria adicionada", "Imagem anexada durante a vistoria.", "Voce", 0),
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
      updatedAt: new Date().toISOString(),
      photos: [{ id: `photo-${crypto.randomUUID()}`, url: photoUrl, originalFilename: "foto-upload.jpg" }, ...occurrence.photos],
      aiAnalyses: [ai, ...occurrence.aiAnalyses],
      latestAIAnalysis: ai,
      timeline: [
        event(`tl-${crypto.randomUUID()}`, "IA_ANALISOU", "Analise inteligente concluida", ai.summary, "ParkFlow AI", 0),
        event(`tl-${crypto.randomUUID()}`, "FOTO_ADICIONADA", "Foto adicionada", "Nova evidencia visual anexada.", "Voce", 0),
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

function buildAI(plate: string, priority: Priority): AIAnalysis {
  return {
    id: `ai-${crypto.randomUUID()}`,
    provider: "OPENAI_SIMULATED",
    model: "gpt-5-mini",
    confidenceScore: priority === "CRITICA" ? 91 : priority === "ALTA" ? 86 : 78,
    severitySuggestion: priority,
    detectedPlate: normalizePlate(plate),
    plateDivergence: false,
    summary: "Dano visual detectado na regiao dianteira/lateral. Ha indicios de parachoque, pintura e suporte afetados.",
    nextStep: "Iniciar vistoria tecnica, anexar fotos complementares e definir encaminhamento para patio ou oficina.",
    createdAt: new Date().toISOString()
  };
}

function buildAIFromResult(plate: string, result: ParkFlowAIResult): AIAnalysis {
  return {
    id: `ai-${crypto.randomUUID()}`,
    provider: "N8N_OPENAI",
    model: "parkflow-webhook",
    confidenceScore: result.confidence,
    severitySuggestion: result.severity,
    damageDetected: result.damageDetected,
    damageType: result.damageType,
    affectedParts: result.affectedParts,
    detectedPlate: result.detectedPlate ?? normalizePlate(plate),
    plateDivergence: Boolean(result.detectedPlate && normalizePlate(result.detectedPlate) !== normalizePlate(plate)),
    summary: result.summary,
    nextStep: result.nextStep,
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
