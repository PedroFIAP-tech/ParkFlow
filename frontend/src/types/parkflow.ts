export type Priority = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
export type OccurrenceStatus =
  | "ABERTA"
  | "EM_ANALISE"
  | "ALERTA_GERADO"
  | "MONITORAMENTO"
  | "RESOLVIDA"
  | "CANCELADA";

export type OccurrenceType =
  | "PLACA_SUSPEITA"
  | "ACESSO_NAO_AUTORIZADO"
  | "CONDUTA_SUSPEITA"
  | "INVASAO"
  | "COLISAO"
  | "VANDALISMO"
  | "DESACORDO_OPERACIONAL"
  | "EVASAO"
  | "FURTO_ROUBO"
  | "DANO_PATRIMONIAL"
  | "OUTROS";

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
  vehicleType?: string;
  evidence?: string;
  operationalRisk?: string;
  detectedPlate: string;
  plateDivergence: boolean;
  summary: string;
  nextStep: string;
  createdAt: string;
};

export type PlateAlert = {
  id: string;
  title: string;
  message: string;
  plate: string;
  previousOccurrenceId?: string;
  previousOccurrenceCode?: string;
  previousUnit: string;
  previousDate: string;
  previousType: OccurrenceType | string;
  riskLevel: Priority;
  createdAt: string;
};

export type OccurrenceSummary = {
  id: string;
  occurrenceCode: string;
  vehicle: Vehicle;
  type: OccurrenceType | string;
  status: OccurrenceStatus;
  priority: Priority;
  location: string;
  stoppedMinutes: number;
  latestAIAnalysis?: AIAnalysis | null;
  latestAlert?: PlateAlert | null;
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
  alerts: PlateAlert[];
  reportedAt: string;
};

export type Unit = {
  id: string;
  name: string;
  code: string;
  type: string;
  city: string;
  address?: string;
  contactName?: string;
  phone?: string;
  active?: boolean;
};
