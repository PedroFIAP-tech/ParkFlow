export type Priority = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
export type OccurrenceStatus =
  | "ABERTA"
  | "AGUARDANDO_VISTORIA"
  | "EM_ANALISE"
  | "AGUARDANDO_DOCUMENTO"
  | "AGUARDANDO_PECA"
  | "ENCAMINHADA_PATIO"
  | "ENCAMINHADA_OFICINA"
  | "FINALIZADA"
  | "CANCELADA";

export type Vehicle = {
  id: string;
  plate: string;
  chassis?: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  ownerName?: string;
};

export type AIAnalysis = {
  id: string;
  provider: string;
  model: string;
  confidenceScore: number;
  severitySuggestion: Priority;
  detectedPlate: string;
  plateDivergence: boolean;
  summary: string;
  nextStep: string;
  createdAt: string;
};

export type OccurrenceSummary = {
  id: string;
  occurrenceCode: string;
  vehicle: Vehicle;
  type: string;
  status: OccurrenceStatus;
  priority: Priority;
  location: string;
  stoppedMinutes: number;
  latestAIAnalysis?: AIAnalysis | null;
  updatedAt: string;
};

export type TimelineEvent = {
  id: string;
  eventType: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
};

export type OccurrenceDetail = OccurrenceSummary & {
  description?: string;
  photos: Array<{ id: string; url: string; originalFilename?: string }>;
  documents: Array<{ id: string; url: string; originalFilename?: string }>;
  timeline: TimelineEvent[];
  aiAnalyses: AIAnalysis[];
  reportedAt: string;
};

