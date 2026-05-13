import { getPlateHistory } from "@/lib/occurrence-store";
import type { OccurrenceDetail, PlateAlert } from "@/types/parkflow";

const STORAGE_KEY = "parkflow_vehicle_presence_v1";
const ALERT_MESSAGE = "Atenção: veículo com histórico de suspeita registrado anteriormente.";

export type VehicleMovement = "ENTRADA" | "SAIDA";
export type VehicleProfile = "VISITANTE" | "MENSALISTA" | "PRESTADOR";
export type VehiclePresenceStatus = "PENDENTE" | "VALIDADO" | "SINALIZADO";

export type VehiclePresenceInput = {
  plate: string;
  unit: string;
  movement: VehicleMovement;
  profile: VehicleProfile;
  imageUrl?: string;
  confidence?: number;
  source: "IA" | "MANUAL";
};

export type VehiclePresence = VehiclePresenceInput & {
  id: string;
  status: VehiclePresenceStatus;
  createdAt: string;
  alert?: PlateAlert | null;
};

const seedActivities: VehiclePresence[] = [
  {
    id: "presence-1",
    plate: "ABC1D23",
    unit: "Unidade Jardins",
    movement: "ENTRADA",
    profile: "VISITANTE",
    source: "IA",
    confidence: 94,
    status: "PENDENTE",
    createdAt: new Date(Date.now() - 1000 * 60).toISOString()
  },
  {
    id: "presence-2",
    plate: "FRT8G45",
    unit: "Unidade Moema",
    movement: "SAIDA",
    profile: "MENSALISTA",
    source: "IA",
    confidence: 91,
    status: "PENDENTE",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString()
  },
  {
    id: "presence-3",
    plate: "JKL9H12",
    unit: "Unidade Itaim",
    movement: "ENTRADA",
    profile: "PRESTADOR",
    source: "IA",
    confidence: 88,
    status: "PENDENTE",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: "presence-4",
    plate: "QWE3R87",
    unit: "Unidade Paulista",
    movement: "ENTRADA",
    profile: "VISITANTE",
    source: "IA",
    confidence: 86,
    status: "PENDENTE",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString()
  }
];

export function loadVehiclePresence() {
  if (typeof window === "undefined") {
    return seedActivities;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    saveVehiclePresence(seedActivities);
    return seedActivities;
  }

  try {
    return JSON.parse(stored) as VehiclePresence[];
  } catch {
    saveVehiclePresence(seedActivities);
    return seedActivities;
  }
}

export function saveVehiclePresence(activities: VehiclePresence[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

export function createVehiclePresence(input: VehiclePresenceInput, occurrences: OccurrenceDetail[]): VehiclePresence {
  const plate = normalizePlate(input.plate);
  const previous = getPlateHistory(occurrences, plate)[0];
  return {
    ...input,
    id: `presence-${crypto.randomUUID()}`,
    plate,
    status: "PENDENTE",
    createdAt: new Date().toISOString(),
    alert: previous
      ? {
          id: `alert-${crypto.randomUUID()}`,
          title: "Placa com historico de suspeita",
          message: ALERT_MESSAGE,
          plate,
          previousOccurrenceId: previous.id,
          previousOccurrenceCode: previous.occurrenceCode,
          previousUnit: previous.location,
          previousDate: previous.reportedAt,
          previousType: previous.type,
          riskLevel: previous.priority,
          createdAt: new Date().toISOString()
        }
      : null
  };
}

export function updateVehiclePresenceStatus(activities: VehiclePresence[], id: string, status: VehiclePresenceStatus) {
  return activities.map((activity) => (activity.id === id ? { ...activity, status } : activity));
}

export function movementLabel(value: VehicleMovement) {
  return value === "ENTRADA" ? "Entrada" : "Saída";
}

export function profileLabel(value: VehicleProfile) {
  const labels: Record<VehicleProfile, string> = {
    VISITANTE: "Visitante",
    MENSALISTA: "Mensalista",
    PRESTADOR: "Prestador"
  };
  return labels[value];
}

function normalizePlate(plate: string) {
  return plate.replace("-", "").trim().toUpperCase();
}
