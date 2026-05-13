"use client";

import { motion } from "framer-motion";
import { Car, Loader2, ScanLine, ShieldAlert, Sparkles } from "lucide-react";
import { PremiumButton, PremiumCard, SkeletonBlock } from "@/components/design-system";
import { PriorityChip } from "@/components/priority-chip";
import type { AIAnalysis } from "@/types/parkflow";

export function AIInsightCard({
  analysis,
  onAnalyze,
  loading
}: {
  analysis?: AIAnalysis | null;
  onAnalyze?: () => void;
  loading?: boolean;
}) {
  return (
    <PremiumCard className="p-5">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 4, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-electric/30 bg-electric/10"
        >
          <Sparkles className="h-5 w-5 text-electric" />
        </motion.div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">ParkFlow AI</p>
          <h2 className="text-xl font-semibold text-white">Analise de evidencia</h2>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-brand/20 bg-brand/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-blue-100">
              <Loader2 className="h-4 w-4 animate-spin" />
              IA analisando evidencia, placa e risco...
            </p>
            <div className="mt-4 space-y-2">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
              <SkeletonBlock className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ) : analysis ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-brand/20 bg-brand/10 p-4 text-sm leading-6 text-blue-100">
            {analysis.summary}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-line bg-black/20 p-3">
              <p className="text-slate-500">Evidencia</p>
              <p className="mt-2 text-sm font-semibold text-white">{analysis.evidence ?? "Imagem em revisao operacional"}</p>
            </div>
            <div className="rounded-xl border border-line bg-black/20 p-3">
              <p className="text-slate-500">Risco sugerido</p>
              <div className="mt-2">
                <PriorityChip priority={analysis.severitySuggestion} />
              </div>
            </div>
            <div className="rounded-xl border border-line bg-black/20 p-3">
              <p className="text-slate-500">Confianca</p>
              <p className="mt-2 text-lg font-semibold text-white">{analysis.confidenceScore}%</p>
            </div>
            <div className="rounded-xl border border-line bg-black/20 p-3">
              <p className="flex items-center gap-2 text-slate-500">
                <Car className="h-4 w-4" />
                Tipo de veículo
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {analysis.vehicleType ?? "Nao classificado"}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-black/20 p-3">
              <p className="flex items-center gap-2 text-slate-500">
                <ScanLine className="h-4 w-4" />
                Placa IA
              </p>
              <p className="mt-2 font-mono text-lg font-semibold text-white">{analysis.detectedPlate || "Nao lida"}</p>
            </div>
            <div className="rounded-xl border border-line bg-black/20 p-3">
              <p className="flex items-center gap-2 text-slate-500">
                <ShieldAlert className="h-4 w-4 text-warning" />
                Risco operacional
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{analysis.operationalRisk ?? (analysis.plateDivergence ? "Placa divergente" : "Sem divergencia")}</p>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-black/20 p-4 text-sm leading-6 text-slate-300">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proximo passo</p>
            {analysis.nextStep}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm leading-6 text-warning">
          Nenhuma analise registrada. A IA e auxiliar: cadastre e acompanhe a ocorrencia mesmo sem imagem.
        </div>
      )}

      {onAnalyze ? (
        <PremiumButton onClick={onAnalyze} disabled={loading} variant="primary" className="mt-5 w-full">
          <Sparkles className="h-4 w-4" />
          {loading ? "Analisando..." : "Executar analise de IA"}
        </PremiumButton>
      ) : null}
    </PremiumCard>
  );
}
