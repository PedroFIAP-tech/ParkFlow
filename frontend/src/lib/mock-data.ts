import type { OccurrenceDetail, OccurrenceSummary, TimelineEvent } from "@/types/parkflow";

export const mockOccurrences: OccurrenceSummary[] = [
  {
    id: "demo-1",
    occurrenceCode: "PF-2026-000148",
    vehicle: {
      id: "veh-1",
      plate: "BRP4K21",
      chassis: "9BWZZZ377VT004251",
      brand: "Volkswagen",
      model: "Nivus Highline",
      color: "Azul"
    },
    type: "PLACA_SUSPEITA",
    status: "ALERTA_GERADO",
    priority: "CRITICA",
    location: "Unidade Paulista",
    stoppedMinutes: 186,
    updatedAt: new Date().toISOString(),
    latestAlert: {
      id: "alert-1",
      title: "Placa com historico de suspeita",
      message: "Atenção: veículo com histórico de suspeita registrado anteriormente.",
      plate: "BRP4K21",
      previousOccurrenceId: "demo-5",
      previousOccurrenceCode: "PF-2026-000144",
      previousUnit: "Unidade Pinheiros",
      previousDate: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      previousType: "EVASAO",
      riskLevel: "ALTA",
      createdAt: new Date().toISOString()
    },
    latestAIAnalysis: {
      id: "ai-1",
      provider: "OPENAI",
      model: "gpt-5-mini",
      confidenceScore: 91.2,
      severitySuggestion: "CRITICA",
      detectedPlate: "BRP4K21",
      plateDivergence: false,
      vehicleType: "SUV azul",
      evidence: "Placa visivel na entrada da unidade",
      operationalRisk: "Reincidencia em unidade diferente",
      summary: "Placa identificada em imagem de entrada com historico anterior de evasao. Risco operacional critico para abordagem assistida.",
      nextStep: "Acionar supervisor, preservar imagem e registrar decisao na timeline da placa.",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "demo-2",
    occurrenceCode: "PF-2026-000147",
    vehicle: {
      id: "veh-2",
      plate: "FLO2W88",
      brand: "Chevrolet",
      model: "Onix Plus",
      color: "Preto"
    },
    type: "ACESSO_NAO_AUTORIZADO",
    status: "EM_ANALISE",
    priority: "ALTA",
    location: "Unidade Vila Olimpia",
    stoppedMinutes: 74,
    updatedAt: new Date().toISOString(),
    latestAIAnalysis: {
      id: "ai-2",
      provider: "OPENAI",
      model: "gpt-5-mini",
      confidenceScore: 82.8,
      severitySuggestion: "ALTA",
      detectedPlate: "FLO2W88",
      plateDivergence: false,
      vehicleType: "Sedan preto",
      evidence: "Entrada sem autorizacao no periodo noturno",
      operationalRisk: "Possivel acesso indevido",
      summary: "Imagem aponta placa legivel e entrada fora do padrao esperado para a unidade.",
      nextStep: "Validar cadastro interno, consultar historico e manter monitoramento ate decisao do supervisor.",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "demo-3",
    occurrenceCode: "PF-2026-000146",
    vehicle: {
      id: "veh-3",
      plate: "PKF7A10",
      brand: "Fiat",
      model: "Argo",
      color: "Branco"
    },
    type: "CONDUTA_SUSPEITA",
    status: "MONITORAMENTO",
    priority: "MEDIA",
    location: "Unidade Leste",
    stoppedMinutes: 38,
    updatedAt: new Date().toISOString(),
    latestAIAnalysis: null
  },
  {
    id: "demo-4",
    occurrenceCode: "PF-2026-000145",
    vehicle: {
      id: "veh-4",
      plate: "SIN8R34",
      brand: "Toyota",
      model: "Corolla",
      color: "Prata"
    },
    type: "OUTROS",
    status: "ABERTA",
    priority: "BAIXA",
    location: "Unidade Shopping Norte",
    stoppedMinutes: 12,
    updatedAt: new Date().toISOString(),
    latestAIAnalysis: null
  }
];

export const mockTimeline: TimelineEvent[] = [
  {
    id: "tl-1",
    eventType: "ALERTA_GERADO",
    title: "Alerta automatico de reincidencia",
    description: "Atenção: veículo com histórico de suspeita registrado anteriormente. Unidade anterior: Unidade Pinheiros. Tipo: Evasao. Risco: ALTA.",
    createdBy: "ParkFlow Security AI",
    createdAt: new Date().toISOString()
  },
  {
    id: "tl-2",
    eventType: "IA_ANALISOU",
    title: "Analise de evidencia concluida",
    description: "IA identificou placa visivel, SUV azul e risco critico por reincidencia.",
    createdBy: "ParkFlow Security AI",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: "tl-3",
    eventType: "EVIDENCIA_ADICIONADA",
    title: "Evidencia visual adicionada",
    description: "Operador anexou imagem da entrada da unidade.",
    createdBy: "Camila Souza",
    createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString()
  },
  {
    id: "tl-4",
    eventType: "OCORRENCIA_CRIADA",
    title: "Ocorrencia de seguranca aberta",
    description: "Registro criado pela central operacional.",
    createdBy: "Rafael Lima",
    createdAt: new Date(Date.now() - 1000 * 60 * 186).toISOString()
  }
];

export function mockDetail(id: string): OccurrenceDetail {
  const occurrence = mockOccurrences.find((item) => item.id === id) ?? mockOccurrences[0];
  return {
    ...occurrence,
    description: "Ocorrencia registrada para seguranca operacional, com foco em placa, unidade, evidencia e decisao rastreavel.",
    photos: [
      {
        id: "photo-1",
        url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=900&q=80",
        originalFilename: "evidencia-entrada.jpg"
      }
    ],
    documents: [
      {
        id: "doc-1",
        url: "#",
        originalFilename: "relatorio-operacional.pdf"
      }
    ],
    timeline: occurrence.id === "demo-1" ? mockTimeline : mockTimeline.slice(1),
    aiAnalyses: occurrence.latestAIAnalysis ? [occurrence.latestAIAnalysis] : [],
    alerts: occurrence.latestAlert ? [occurrence.latestAlert] : [],
    reportedAt: new Date(Date.now() - 1000 * 60 * occurrence.stoppedMinutes).toISOString()
  };
}
