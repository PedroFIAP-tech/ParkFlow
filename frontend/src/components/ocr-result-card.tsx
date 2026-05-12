"use client";

import { motion } from "framer-motion";
import { FileScan, Gauge, Loader2, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SkeletonBlock } from "@/components/design-system";
import type { AIAnalysisStatus, ParkFlowOCRResult } from "@/lib/ai-analysis";

export function OCRResultCard({
  status,
  result,
  message
}: {
  status: AIAnalysisStatus;
  result?: ParkFlowOCRResult | null;
  message?: string;
}) {
  if (status === "idle") {
    return (
      <div className="rounded-xl border border-line bg-black/20 p-3 text-sm text-slate-500">
        OCR disponivel para placa, texto extraido, modelo e documento quando houver imagem selecionada.
      </div>
    );
  }

  if (status === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-electric/25 bg-brand/10 p-4"
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-blue-100">
          <Loader2 className="h-4 w-4 animate-spin text-electric" />
          Executando OCR...
        </p>
        <div className="mt-4 space-y-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-4/5" />
        </div>
      </motion.div>
    );
  }

  if (status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-red-100"
      >
        <p className="font-semibold text-danger">OCR indisponivel</p>
        <p className="mt-1 text-slate-300">{message ?? "Nao foi possivel ler a imagem."}</p>
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
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-electric/25 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(3,7,18,0.92))] p-4 shadow-[0_18px_60px_rgba(31,111,235,0.12)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-electric/30 bg-electric/10">
          <FileScan className="h-5 w-5 text-electric" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">OCR n8n</p>
          <h3 className="font-semibold text-white">Leitura concluida</h3>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Placa" value={result.plate} icon={ScanLine} />
        <Info label="Confianca" value={`${result.confidence}%`} icon={Gauge} />
        <Info label="Modelo" value={result.model} icon={FileScan} />
        <Info label="Documento" value={result.document} icon={FileScan} />
      </div>

      <div className="mt-3 rounded-xl border border-line bg-black/20 p-3 text-sm leading-6 text-slate-300">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Texto extraido</p>
        {result.extractedText}
      </div>
    </motion.div>
  );
}

function Info({
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
