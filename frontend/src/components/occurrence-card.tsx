"use client";

import clsx from "clsx";
import { AlertTriangle, BrainCircuit, Clock, MapPin, Route, ScanLine, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PriorityChip } from "@/components/priority-chip";
import { StatusBadge } from "@/components/status-badge";
import type { OccurrenceSummary } from "@/types/parkflow";

type TypeTone = "red" | "orange" | "blue" | "yellow" | "green";

const toneStyles: Record<TypeTone, { card: string; accent: string; chip: string; text: string; insight: string; icon: string }> = {
  red: {
    card: "border-danger/30 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.12),transparent_36%),rgba(2,6,23,0.56)] hover:border-danger/50",
    accent: "bg-danger",
    chip: "border-danger/30 bg-danger/10 text-red-100",
    text: "text-red-100",
    insight: "border-danger/25 bg-danger/10 text-red-100",
    icon: "text-danger"
  },
  orange: {
    card: "border-orange-400/28 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_36%),rgba(2,6,23,0.56)] hover:border-orange-300/45",
    accent: "bg-orange-400",
    chip: "border-orange-400/30 bg-orange-400/10 text-orange-100",
    text: "text-orange-100",
    insight: "border-orange-400/25 bg-orange-400/10 text-orange-100",
    icon: "text-orange-300"
  },
  blue: {
    card: "border-electric/24 bg-[radial-gradient(circle_at_top_right,rgba(66,165,255,0.12),transparent_36%),rgba(2,6,23,0.56)] hover:border-electric/50",
    accent: "bg-electric",
    chip: "border-electric/30 bg-brand/10 text-blue-100",
    text: "text-blue-100",
    insight: "border-brand/25 bg-brand/10 text-blue-100",
    icon: "text-electric"
  },
  yellow: {
    card: "border-warning/26 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_36%),rgba(2,6,23,0.56)] hover:border-warning/45",
    accent: "bg-warning",
    chip: "border-warning/30 bg-warning/10 text-yellow-100",
    text: "text-yellow-100",
    insight: "border-warning/25 bg-warning/10 text-yellow-100",
    icon: "text-warning"
  },
  green: {
    card: "border-success/24 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_36%),rgba(2,6,23,0.56)] hover:border-success/45",
    accent: "bg-success",
    chip: "border-success/30 bg-success/10 text-green-100",
    text: "text-green-100",
    insight: "border-success/25 bg-success/10 text-green-100",
    icon: "text-success"
  }
};

export function OccurrenceCard({ occurrence, index = 0 }: { occurrence: OccurrenceSummary; index?: number }) {
  const context = getOccurrenceContext(occurrence);
  const tone = toneStyles[context.tone];
  const timeLabel = occurrence.status === "RESOLVIDA" ? `${occurrence.stoppedMinutes} min monitorado` : `${occurrence.stoppedMinutes} min em aberto`;
  const vehicleModel = occurrence.vehicle.model?.trim();
  const normalizedVehicleModel = vehicleModel?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const showVehicleModel = vehicleModel && normalizedVehicleModel !== "veiculo monitorado";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.26 }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={`/ocorrencias/${occurrence.id}`}
        className={clsx(
          "group relative block overflow-hidden rounded-xl border p-4 shadow-[0_18px_54px_rgba(0,0,0,0.18)] transition",
          tone.card
        )}
      >
        <span className={clsx("absolute inset-x-0 top-0 h-1 opacity-80", tone.accent)} />

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</span>
              <PriorityChip priority={occurrence.priority} />
              <StatusBadge status={occurrence.status} />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-black/20 px-3 py-2 text-sm text-slate-300">
            <Clock className="h-4 w-4 text-warning" />
            <span>{timeLabel}</span>
          </div>
        </div>

        <div className="mt-5">
          <p className="font-mono text-2xl font-black tracking-normal text-white min-[380px]:text-3xl">{occurrence.vehicle.plate}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={clsx("inline-flex min-h-9 items-center rounded-lg border px-3 py-1 text-base font-black", tone.chip)}>
              {context.title}
            </span>
            <span className={clsx("text-sm font-semibold", tone.text)}>{context.action}</span>
          </div>
          {showVehicleModel ? <p className="mt-2 text-sm text-slate-500">{vehicleModel}</p> : null}
        </div>

        <div className="mt-5 grid gap-2 text-sm text-slate-300 min-[520px]:grid-cols-3">
          <MetaItem icon={MapPin} label="Unidade" value={occurrence.location} />
          <MetaItem icon={ScanLine} label="IA" value={occurrence.latestAIAnalysis ? `${occurrence.latestAIAnalysis.confidenceScore}%` : "Pendente"} />
          <MetaItem icon={Route} label="Fluxo" value={context.flow} />
        </div>

        {occurrence.latestAlert ? (
          <div className="mt-4 rounded-lg border border-danger/25 bg-danger/10 p-3 text-sm leading-6 text-red-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              <div>
                <strong className="block text-danger">{context.alertTitle}</strong>
                <span className="mt-1 block text-slate-300">
                  Unidade anterior: {occurrence.latestAlert.previousUnit} - Risco: {occurrence.latestAlert.riskLevel}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <div className={clsx("mt-4 rounded-lg border p-3 text-sm leading-6", tone.insight)}>
          <div className="flex items-start gap-2">
            <BrainCircuit className={clsx("mt-0.5 h-4 w-4 shrink-0", tone.icon)} />
            <span>{context.summary}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-lg border border-line bg-black/20 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">{label}</p>
        <p className="truncate font-medium text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function getOccurrenceContext(occurrence: OccurrenceSummary) {
  if (occurrence.status === "RESOLVIDA") {
    return {
      title: operationalTypeTitle(occurrence.type, occurrence.latestAlert),
      action: "Encerrada",
      flow: "Resolvido",
      tone: "green" as TypeTone,
      alertTitle: "Histórico validado",
      summary: "Ocorrência resolvida com registro operacional preservado."
    };
  }

  if (occurrence.latestAlert) {
    return {
      title: "Reincidência de Suspeita",
      action: "Validar histórico entre unidades",
      flow: "Alerta cruzado",
      tone: "orange" as TypeTone,
      alertTitle: "Placa reincidente encontrada em outra unidade",
      summary: "Placa reincidente encontrada em outra unidade. Revisar histórico antes da decisão."
    };
  }

  const title = operationalTypeTitle(occurrence.type, null);
  const normalizedType = String(occurrence.type).toUpperCase();

  if (["FURTO_ROUBO", "INVASAO", "ACESSO_NAO_AUTORIZADO", "VANDALISMO"].includes(normalizedType)) {
    return {
      title,
      action: "Ação imediata recomendada",
      flow: "Segurança",
      tone: "red" as TypeTone,
      alertTitle: "Alerta de risco crítico",
      summary: summaryForType(normalizedType)
    };
  }

  if (["PLACA_SUSPEITA", "CONDUTA_SUSPEITA", "EVASAO"].includes(normalizedType)) {
    return {
      title,
      action: "Monitorar e validar placa",
      flow: "Suspeita",
      tone: "orange" as TypeTone,
      alertTitle: "Alerta de comportamento suspeito",
      summary: summaryForType(normalizedType)
    };
  }

  if (["COLISAO", "DANO_PATRIMONIAL"].includes(normalizedType)) {
    return {
      title,
      action: "Registrar evidências",
      flow: "Incidente",
      tone: "yellow" as TypeTone,
      alertTitle: "Alerta de incidente operacional",
      summary: summaryForType(normalizedType)
    };
  }

  return {
    title,
    action: "Revisar ocorrência",
    flow: "Operacional",
    tone: "blue" as TypeTone,
    alertTitle: "Ocorrência operacional",
    summary: summaryForType(normalizedType)
  };
}

function operationalTypeTitle(type: string, alert: OccurrenceSummary["latestAlert"]) {
  if (alert) {
    return "Reincidência de Suspeita";
  }

  const titles: Record<string, string> = {
    PLACA_SUSPEITA: "Veículo Suspeito",
    ACESSO_NAO_AUTORIZADO: "Acesso Não Autorizado",
    CONDUTA_SUSPEITA: "Movimentação Suspeita",
    INVASAO: "Invasão de Área Restrita",
    COLISAO: "Colisão Operacional",
    VANDALISMO: "Vandalismo",
    DESACORDO_OPERACIONAL: "Desacordo Operacional",
    EVASAO: "Evasão de Cancela",
    FURTO_ROUBO: "Tentativa de Furto/Roubo",
    DANO_PATRIMONIAL: "Dano Patrimonial",
    OUTROS: "Ocorrência Operacional"
  };

  return titles[String(type).toUpperCase()] ?? "Ocorrência Operacional";
}

function summaryForType(type: string) {
  const summaries: Record<string, string> = {
    PLACA_SUSPEITA: "IA identificou veículo com comportamento suspeito. Validar placa e contexto da unidade.",
    ACESSO_NAO_AUTORIZADO: "Acesso não autorizado identificado. Conferir permissão e acionar responsável.",
    CONDUTA_SUSPEITA: "Movimentação suspeita identificada. Manter monitoramento e registrar decisão.",
    INVASAO: "Possível invasão de área restrita. Priorizar verificação da equipe local.",
    COLISAO: "Colisão detectada na área operacional. Registrar evidências e ponto de impacto.",
    VANDALISMO: "IA identificou possível vandalismo. Preservar imagens e validar responsáveis.",
    DESACORDO_OPERACIONAL: "Ocorrência operacional fora do padrão. Revisar procedimento e evidências.",
    EVASAO: "Possível evasão identificada. Conferir placa, horário e passagem pela cancela.",
    FURTO_ROUBO: "IA identificou possível tentativa de furto ou roubo. Ação imediata recomendada.",
    DANO_PATRIMONIAL: "Dano patrimonial detectado. Vincular evidências e comunicar a unidade.",
    OUTROS: "IA sinalizou ocorrência operacional. Revisar placa, contexto e próxima ação."
  };

  return summaries[type] ?? "IA sinalizou ocorrência operacional. Revisar placa, contexto e próxima ação.";
}
