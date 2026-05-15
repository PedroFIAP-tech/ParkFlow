"use client";

import {
  ArrowLeft,
  AlertTriangle,
  Camera,
  FileText,
  FileUp,
  MapPin,
  Radar,
  Send,
  TimerReset
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AIInsightCard } from "@/components/ai-insight-card";
import { AppShell } from "@/components/app-shell";
import { PremiumButton, PremiumCard, SectionTitle, SkeletonBlock } from "@/components/design-system";
import { OperationalTimeline } from "@/components/operational-timeline";
import { PriorityChip } from "@/components/priority-chip";
import { StatusBadge } from "@/components/status-badge";
import { Toast, type ToastState } from "@/components/toast";
import {
  addPhotoAndAI,
  applyInspection,
  loadOccurrences,
  saveOccurrences,
  setOccurrenceStatus,
  statusLabel,
  typeLabel
} from "@/lib/occurrence-store";
import type { OccurrenceDetail, OccurrenceStatus, TimelineEvent } from "@/types/parkflow";

const statusActions: Array<{ label: string; status: OccurrenceStatus; icon: LucideIcon }> = [
  { label: "Gerar alerta", status: "ALERTA_GERADO", icon: AlertTriangle },
  { label: "Em analise", status: "EM_ANALISE", icon: FileText },
  { label: "Monitorar placa", status: "MONITORAMENTO", icon: Radar },
  { label: "Resolver", status: "RESOLVIDA", icon: Send }
];

export default function OccurrenceDetailPage() {
  const params = useParams<{ id: string }>();
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const occurrence = useMemo(
    () => occurrences.find((item) => item.id === params.id) ?? null,
    [occurrences, params.id]
  );

  useEffect(() => {
    setOccurrences(loadOccurrences());
  }, []);

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3000);
  }

  function commit(next: OccurrenceDetail[]) {
    setOccurrences(next);
    saveOccurrences(next);
  }

  function runAI() {
    if (!occurrence) {
      return;
    }
    setLoadingAI(true);
    window.setTimeout(() => {
      const image = occurrence.photos[0]?.url ?? "https://res.cloudinary.com/demo/image/upload/c_fill,w_900,h_560,q_auto/sample.jpg";
      commit(addPhotoAndAI(occurrences, occurrence.id, image));
      setLoadingAI(false);
      showToast({ type: "success", message: "Analise de evidencia simulada e timeline atualizada." });
    }, 1100);
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    if (!occurrence) {
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLoadingAI(true);
      window.setTimeout(() => {
        commit(addPhotoAndAI(occurrences, occurrence.id, String(reader.result)));
        setLoadingAI(false);
        showToast({ type: "success", message: "Evidencia adicionada e analisada pela IA em modo demo." });
      }, 1000);
    };
    reader.readAsDataURL(file);
  }

  function addDocument() {
    if (!occurrence) {
      return;
    }
    const next = occurrences.map((item) => {
      if (item.id !== occurrence.id) {
        return item;
      }
      return {
        ...item,
        documents: [
          {
            id: `doc-${crypto.randomUUID()}`,
            url: "#",
            originalFilename: `relatorio-${item.documents.length + 1}.pdf`
          },
          ...item.documents
        ],
        timeline: [
          buildEvent("DOCUMENTO_ADICIONADO", "Relatorio adicionado", "Arquivo operacional anexado ao caso.", "Voce"),
          ...item.timeline
        ],
        updatedAt: new Date().toISOString()
      };
    });
    commit(next);
    showToast({ type: "success", message: "Relatorio simulado anexado ao caso." });
  }

  function startInspection() {
    if (!occurrence) {
      return;
    }
    commit(applyInspection(occurrences, {
      occurrenceId: occurrence.id,
      observation: "Evidencia registrada a partir do detalhe da ocorrencia."
    }));
    showToast({ type: "success", message: "Evidencia registrada e status movido para EM_ANALISE." });
  }

  function changeStatus(status: OccurrenceStatus) {
    if (!occurrence) {
      return;
    }
    commit(setOccurrenceStatus(occurrences, occurrence.id, status));
    showToast({ type: "success", message: `Status alterado para ${statusLabel(status)}.` });
  }

  const latestAI = occurrence?.aiAnalyses[0] ?? occurrence?.latestAIAnalysis;

  if (!occurrence) {
    return (
      <AppShell title="Ocorrencia" subtitle="Carregando detalhe operacional">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <SkeletonBlock className="h-80" />
          <SkeletonBlock className="h-80" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Ocorrencia ${occurrence.vehicle.plate}`}
      subtitle={`${occurrence.occurrenceCode} - detalhe operacional`}
      action={
        <Link href="/" replace>
          <PremiumButton variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Central
          </PremiumButton>
        </Link>
      }
    >
      <Toast toast={toast} />

      <header className="glass-panel rounded-2xl p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</span>
              <PriorityChip priority={occurrence.priority} />
              <StatusBadge status={occurrence.status} />
            </div>
            <h1 className="mt-3 text-4xl font-semibold text-white">{occurrence.vehicle.plate}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
              <span>{typeLabel(occurrence.type)}</span>
              <span>{occurrence.vehicle.brand} {occurrence.vehicle.model}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {occurrence.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <TimerReset className="h-4 w-4 text-warning" />
                {occurrence.stoppedMinutes} min em aberto
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{occurrence.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-slate-950/50 px-4 text-sm font-semibold text-slate-100 transition hover:border-electric/45 hover:bg-slate-900/80">
              <Camera className="h-4 w-4" />
              Adicionar evidencia
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
            <PremiumButton variant="secondary" onClick={addDocument}>
              <FileUp className="h-4 w-4" />
              Relatorio
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={startInspection}>
              <FileText className="h-4 w-4" />
              Evidencia
            </PremiumButton>
            <PremiumButton variant="primary" onClick={() => changeStatus("MONITORAMENTO")}>
              <Send className="h-4 w-4" />
              Monitorar
            </PremiumButton>
          </div>
        </div>
      </header>

      {occurrence.alerts.length ? (
        <section className="mt-6 rounded-2xl border border-danger/35 bg-danger/10 p-5 text-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-danger" />
            <div>
              <h2 className="text-lg font-semibold text-danger">{occurrence.alerts[0].title}</h2>
              <p className="mt-2 text-sm leading-6">{occurrence.alerts[0].message}</p>
              <p className="mt-3 text-sm text-slate-300">
                Unidade anterior: <span className="text-white">{occurrence.alerts[0].previousUnit}</span> - Data:{" "}
                <span className="text-white">{formatDate(occurrence.alerts[0].previousDate)}</span> - Tipo:{" "}
                <span className="text-white">{typeLabel(occurrence.alerts[0].previousType)}</span> - Nivel de risco:{" "}
                <span className="text-white">{occurrence.alerts[0].riskLevel}</span>
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <PremiumCard className="p-5">
            <SectionTitle eyebrow="Evidencias" title="Imagens e relatorios" />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {occurrence.photos.map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-xl border border-line bg-black/30">
                  <Image
                    src={photo.url}
                    alt={photo.originalFilename ?? "Evidencia da ocorrencia"}
                    width={900}
                    height={560}
                    unoptimized
                    className="h-64 w-full object-cover"
                  />
                  <div className="flex items-center justify-between p-3 text-sm text-slate-300">
                    <span>{photo.originalFilename}</span>
                    <span className="rounded-md border border-brand/25 bg-brand/10 px-2 py-1 text-xs text-electric">IA auxiliar</span>
                  </div>
                </div>
              ))}
              <div className="flex min-h-64 flex-col justify-center rounded-xl border border-dashed border-line bg-black/20 p-5 text-sm text-slate-400">
                <FileText className="mb-3 h-8 w-8 text-electric" />
                <strong className="text-white">{occurrence.documents.length} relatorio(s)</strong>
                <span className="mt-1">Clique em Relatorio para anexar outro arquivo simulado.</span>
              </div>
            </div>
          </PremiumCard>

          <OperationalTimeline events={occurrence.timeline} />
        </div>

        <aside className="space-y-6">
          <AIInsightCard analysis={latestAI} onAnalyze={runAI} loading={loadingAI} />

          <PremiumCard className="p-5">
            <SectionTitle eyebrow="Acoes rapidas" title="Encaminhamento" />
            <div className="mt-4 grid gap-3">
              {statusActions.map((action) => {
                const Icon = action.icon;
                return (
                  <PremiumButton key={action.status} variant="secondary" className="justify-start" onClick={() => changeStatus(action.status)}>
                    <Icon className="h-4 w-4 text-electric" />
                    {action.label}
                  </PremiumButton>
                );
              })}
            </div>
          </PremiumCard>
        </aside>
      </section>
    </AppShell>
  );
}

function buildEvent(eventType: string, title: string, description: string, createdBy: string): TimelineEvent {
  return {
    id: `tl-${crypto.randomUUID()}`,
    eventType,
    title,
    description,
    createdBy,
    createdAt: new Date().toISOString()
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
