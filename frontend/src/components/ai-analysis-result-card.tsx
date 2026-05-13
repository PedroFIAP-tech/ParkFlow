"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { BrainCircuit, Car, CheckCircle2, Gauge, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SkeletonBlock } from "@/components/design-system";
import type { AIAnalysisStatus, ParkFlowAIResult } from "@/lib/ai-analysis";
import type { Priority } from "@/types/parkflow";

const severityTone: Record<Priority, string> = {
  BAIXA: "border-success/30 bg-success/10 text-success",
  MEDIA: "border-warning/30 bg-warning/10 text-warning",
  ALTA: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  CRITICA: "border-danger/35 bg-danger/10 text-danger"
};

export function AIAnalysisResultCard({
  status,
  result,
  message
}: {
  status: AIAnalysisStatus;
  result?: ParkFlowAIResult | null;
  message?: string;
}) {
  if (status === "idle") {
    return (
      <div className="rounded-xl border border-line bg-black/20 p-3 text-sm text-slate-500">
        Anexe uma evidencia e clique em Analisar com IA para tentar ler placa, veículo, risco e resumo.
      </div>
    );
  }

  if (status === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl border border-electric/25 bg-[radial-gradient(circle_at_top_left,rgba(66,165,255,0.2),transparent_34%),rgba(31,111,235,0.1)] p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-electric/30 bg-electric/10">
            <Loader2 className="h-5 w-5 animate-spin text-electric" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Analisando com IA</p>
            <p className="text-xs text-slate-400">Lendo imagem, placa, contexto e risco...</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>
      </motion.div>
    );
  }

  if (status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm leading-6 text-red-100"
      >
        <p className="font-semibold text-danger">IA indisponivel agora</p>
        <p className="mt-1 text-slate-300">{message ?? "Nao foi possivel concluir a analise. Tente novamente."}</p>
      </motion.div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-electric/25 bg-[radial-gradient(circle_at_top_left,rgba(66,165,255,0.22),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(3,7,18,0.92))] p-4 shadow-[0_18px_60px_rgba(31,111,235,0.16)]"
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-electric/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 4, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-electric/30 bg-electric/10"
          >
            <BrainCircuit className="h-5 w-5 text-electric" />
          </motion.div>
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-electric" />
              ParkFlow AI
            </p>
            <h3 className="mt-1 font-semibold text-white">Analise de evidencia pronta</h3>
          </div>
        </div>
        <span className={clsx("rounded-full border px-2.5 py-1 text-xs font-bold", severityTone[result.severity])}>
          {result.severity}
        </span>
      </div>

      <div className="relative mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <InfoTile label="Placa visivel" value={result.detectedPlate ?? result.plateVisible} icon={CheckCircle2} />
        <InfoTile label="Tipo de veículo" value={result.vehicleType} icon={Car} />
        <InfoTile label="Confianca" value={`${result.confidence}%`} icon={Gauge} />
        <InfoTile label="Evidencia relevante" value={result.evidence} icon={ShieldAlert} />
      </div>

      <div className="relative mt-3 rounded-xl border border-line bg-black/20 p-3 text-sm leading-6 text-slate-300">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resumo</p>
        {result.summary}
      </div>

      <div className="relative mt-3 rounded-xl border border-brand/25 bg-brand/10 p-3 text-sm leading-6 text-blue-100">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Risco e proximo passo</p>
        <span className="mb-2 block text-white">{result.operationalRisk}</span>
        {result.nextStep}
      </div>
    </motion.div>
  );
}

function InfoTile({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-line bg-black/20 p-3">
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className="h-3.5 w-3.5 text-electric" />
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
