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
    type: "COLISAO",
    status: "EM_ANALISE",
    priority: "CRITICA",
    location: "Unidade Brasil Park - Centro",
    stoppedMinutes: 186,
    updatedAt: new Date().toISOString(),
    latestAIAnalysis: {
      id: "ai-1",
      provider: "OPENAI",
      model: "gpt-5-mini",
      confidenceScore: 91.2,
      severitySuggestion: "CRITICA",
      detectedPlate: "BRP4K21",
      plateDivergence: false,
      summary: "Dano frontal com possivel comprometimento de parachoque, grade e sensor. Priorizar vistoria antes de movimentar.",
      nextStep: "Iniciar vistoria tecnica e encaminhar para oficina credenciada.",
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
    type: "AVARIA",
    status: "AGUARDANDO_DOCUMENTO",
    priority: "ALTA",
    location: "Patio Norte",
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
      summary: "Avaria lateral com necessidade de documento complementar para concluir triagem.",
      nextStep: "Solicitar documento pendente e manter em fila de acompanhamento.",
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
    type: "PANE",
    status: "AGUARDANDO_VISTORIA",
    priority: "MEDIA",
    location: "Base Operacional Leste",
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
    type: "DOCUMENTACAO",
    status: "ABERTA",
    priority: "BAIXA",
    location: "Unidade Shopping",
    stoppedMinutes: 12,
    updatedAt: new Date().toISOString(),
    latestAIAnalysis: null
  }
];

export const mockTimeline: TimelineEvent[] = [
  {
    id: "tl-1",
    eventType: "IA_ANALISOU",
    title: "Analise inteligente concluida",
    description: "IA sugeriu prioridade critica e vistoria tecnica imediata.",
    createdBy: "ParkFlow AI",
    createdAt: new Date().toISOString()
  },
  {
    id: "tl-2",
    eventType: "FOTO_ADICIONADA",
    title: "Fotos do dano adicionadas",
    description: "Operador anexou 4 imagens do veiculo.",
    createdBy: "Camila Souza",
    createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString()
  },
  {
    id: "tl-3",
    eventType: "OCORRENCIA_CRIADA",
    title: "Ocorrencia aberta",
    description: "Registro criado pela central operacional.",
    createdBy: "Rafael Lima",
    createdAt: new Date(Date.now() - 1000 * 60 * 186).toISOString()
  }
];

export function mockDetail(id: string): OccurrenceDetail {
  const occurrence = mockOccurrences.find((item) => item.id === id) ?? mockOccurrences[0];
  return {
    ...occurrence,
    description: "Ocorrencia registrada para avaliacao operacional, com foco em reduzir tempo parado e acelerar o encaminhamento.",
    photos: [
      {
        id: "photo-1",
        url: "https://res.cloudinary.com/demo/image/upload/w_900,c_fill,q_auto/sample.jpg",
        originalFilename: "vistoria-frontal.jpg"
      }
    ],
    documents: [
      {
        id: "doc-1",
        url: "#",
        originalFilename: "boletim-operacional.pdf"
      }
    ],
    timeline: mockTimeline,
    aiAnalyses: occurrence.latestAIAnalysis ? [occurrence.latestAIAnalysis] : [],
    reportedAt: new Date(Date.now() - 1000 * 60 * occurrence.stoppedMinutes).toISOString()
  };
}
