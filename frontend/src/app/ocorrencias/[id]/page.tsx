"use client";

import {
  ArrowLeft,
  Camera,
  ClipboardCheck,
  FileUp,
  MapPin,
  Route,
  Send,
  Sparkles,
  TimerReset
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PriorityChip } from "@/components/priority-chip";
import { StatusBadge } from "@/components/status-badge";
import { analyzeOccurrence, getOccurrence } from "@/lib/api";
import { mockDetail } from "@/lib/mock-data";
import type { OccurrenceDetail } from "@/types/parkflow";

export default function OccurrenceDetailPage() {
  const params = useParams<{ id: string }>();
  const [occurrence, setOccurrence] = useState<OccurrenceDetail>(() => mockDetail(params.id));
  const [loadingAI, setLoadingAI] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getOccurrence(params.id)
      .then(setOccurrence)
      .catch(() => setOccurrence(mockDetail(params.id)));
  }, [params.id]);

  async function runAI() {
    setLoadingAI(true);
    setNotice("");
    try {
      await analyzeOccurrence(params.id);
      const updated = await getOccurrence(params.id);
      setOccurrence(updated);
      setNotice("Analise inteligente concluida.");
    } catch {
      setNotice("Nao foi possivel executar IA pela API. Verifique token, backend e OPENAI_API_KEY.");
    } finally {
      setLoadingAI(false);
    }
  }

  const latestAI = occurrence.aiAnalyses[0] ?? occurrence.latestAIAnalysis;

  return (
    <main className="operation-grid min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Voltar para central
        </Link>

        <header className="glass-panel mt-4 rounded-lg p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</span>
                <PriorityChip priority={occurrence.priority} />
                <StatusBadge status={occurrence.status} />
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-white">{occurrence.vehicle.plate}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>{occurrence.type}</span>
                <span>{occurrence.vehicle.brand} {occurrence.vehicle.model}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {occurrence.location}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-black/25 px-3 text-sm text-slate-200 transition hover:border-electric/45">
                <Camera className="h-4 w-4" />
                Foto
              </button>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-black/25 px-3 text-sm text-slate-200 transition hover:border-electric/45">
                <FileUp className="h-4 w-4" />
                Documento
              </button>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-black/25 px-3 text-sm text-slate-200 transition hover:border-electric/45">
                <ClipboardCheck className="h-4 w-4" />
                Vistoria
              </button>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                <Send className="h-4 w-4" />
                Encaminhar
              </button>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            <div className="glass-panel rounded-lg p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Midias e documentos</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Evidencias da ocorrencia</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-slate-300">
                  <TimerReset className="h-4 w-4 text-warning" />
                  {occurrence.stoppedMinutes} min parado
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {occurrence.photos.map((photo) => (
                  <div key={photo.id} className="overflow-hidden rounded-lg border border-line bg-black/30">
                    <Image src={photo.url} alt={photo.originalFilename ?? "Foto da ocorrencia"} width={900} height={560} className="h-64 w-full object-cover" />
                    <div className="p-3 text-sm text-slate-300">{photo.originalFilename}</div>
                  </div>
                ))}
                <div className="rounded-lg border border-dashed border-line bg-black/20 p-5 text-sm text-slate-400">
                  {occurrence.documents.length} documento(s) anexado(s)
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-lg p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Rastreabilidade</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Timeline operacional</h2>
              <div className="mt-5 space-y-5">
                {occurrence.timeline.map((event) => (
                  <div key={event.id} className="relative border-l border-line pl-5">
                    <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-electric" />
                    <p className="text-sm font-semibold text-white">{event.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{event.description}</p>
                    <p className="mt-2 text-xs text-slate-600">{event.createdBy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass-panel rounded-lg p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-electric/30 bg-electric/10">
                  <Sparkles className="h-5 w-5 text-electric" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Analise inteligente</p>
                  <h2 className="text-xl font-semibold text-white">ParkFlow AI</h2>
                </div>
              </div>

              {latestAI ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-lg border border-brand/20 bg-brand/10 p-4 text-sm leading-6 text-blue-100">
                    {latestAI.summary}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-line bg-black/20 p-3">
                      <p className="text-slate-500">Gravidade</p>
                      <p className="mt-1 font-semibold text-white">{latestAI.severitySuggestion}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-black/20 p-3">
                      <p className="text-slate-500">Confianca</p>
                      <p className="mt-1 font-semibold text-white">{latestAI.confidenceScore}%</p>
                    </div>
                    <div className="rounded-lg border border-line bg-black/20 p-3">
                      <p className="text-slate-500">Placa IA</p>
                      <p className="mt-1 font-semibold text-white">{latestAI.detectedPlate || "Nao lida"}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-black/20 p-3">
                      <p className="text-slate-500">Divergencia</p>
                      <p className="mt-1 font-semibold text-white">{latestAI.plateDivergence ? "Sim" : "Nao"}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-line bg-black/20 p-4 text-sm text-slate-300">
                    <p className="mb-2 text-slate-500">Proximo passo</p>
                    {latestAI.nextStep}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
                  Nenhuma analise de IA registrada para esta ocorrencia.
                </div>
              )}

              {notice ? <p className="mt-4 rounded-md border border-line bg-black/20 p-3 text-sm text-slate-300">{notice}</p> : null}

              <button
                onClick={runAI}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                <Sparkles className="h-4 w-4" />
                {loadingAI ? "Analisando..." : "Executar analise de IA"}
              </button>
            </div>

            <div className="glass-panel rounded-lg p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Encaminhamento</p>
              <div className="mt-4 grid gap-3">
                <button className="flex h-12 items-center gap-2 rounded-lg border border-line bg-black/20 px-3 text-sm text-slate-200">
                  <Route className="h-4 w-4 text-electric" />
                  Enviar para patio
                </button>
                <button className="flex h-12 items-center gap-2 rounded-lg border border-line bg-black/20 px-3 text-sm text-slate-200">
                  <ClipboardCheck className="h-4 w-4 text-electric" />
                  Alterar status
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

