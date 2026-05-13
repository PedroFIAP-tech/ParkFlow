"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Camera, Car, MapPin, ShieldAlert, Sparkles, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { AIAnalysisResultCard } from "@/components/ai-analysis-result-card";
import { PremiumButton } from "@/components/design-system";
import { OCRResultCard } from "@/components/ocr-result-card";
import {
  requestParkFlowAI,
  requestParkFlowOCR,
  type AIAnalysisStatus,
  type ParkFlowAIResult,
  type ParkFlowOCRResult
} from "@/lib/ai-analysis";
import { getPlateHistory, typeLabel, type NewOccurrenceInput } from "@/lib/occurrence-store";
import type { OccurrenceDetail, Priority } from "@/types/parkflow";

const emptyForm = {
  plate: "",
  type: "PLACA_SUSPEITA",
  location: "",
  priority: "MEDIA" as Priority,
  description: ""
};

export function NewOccurrenceModal({
  open,
  onClose,
  onCreate,
  occurrences = [],
  onError
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewOccurrenceInput) => void;
  occurrences?: OccurrenceDetail[];
  onError?: (message: string) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiStatus, setAiStatus] = useState<AIAnalysisStatus>("idle");
  const [aiResult, setAiResult] = useState<ParkFlowAIResult | null>(null);
  const [aiError, setAiError] = useState("");
  const [ocrStatus, setOcrStatus] = useState<AIAnalysisStatus>("idle");
  const [ocrResult, setOcrResult] = useState<ParkFlowOCRResult | null>(null);
  const [ocrError, setOcrError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setError("");
      setPhotoUrls([]);
      setImageFile(null);
      setAiStatus("idle");
      setAiResult(null);
      setAiError("");
      setOcrStatus("idle");
      setOcrResult(null);
      setOcrError("");
    }
  }, [open]);

  const plateHistory = useMemo(() => getPlateHistory(occurrences, form.plate), [form.plate, occurrences]);
  const previousOccurrence = plateHistory[0];

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "plate" || key === "description") {
      setAiStatus((current) => (current === "success" ? "idle" : current));
      setAiResult(null);
      setAiError("");
    }
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setImageFile(files[0]);
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          })
      )
    ).then((urls) => {
      setPhotoUrls((current) => [...current, ...urls]);
      setAiStatus("idle");
      setAiResult(null);
      setAiError("");
      setOcrStatus("idle");
      setOcrResult(null);
      setOcrError("");
    });
  }

  async function analyzeWithAI() {
    setError("");
    setAiError("");

    if (!imageFile) {
      setAiStatus("error");
      setAiError("Selecione uma imagem antes de analisar com IA.");
      return;
    }

    setAiStatus("loading");
    setAiResult(null);

    try {
      const result = await requestParkFlowAI({
        occurrenceId: `draft-${Date.now()}`,
        plate: form.plate,
        description: form.description || "Analise auxiliar de evidencia de seguranca operacional.",
        image: imageFile
      });
      setAiResult(result);
      setAiStatus("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel analisar a imagem.";
      setAiStatus("error");
      setAiError(message);
      onError?.(message);
    }
  }

  async function runOCR() {
    setError("");
    setOcrError("");

    if (!imageFile) {
      setOcrStatus("error");
      setOcrError("Selecione uma imagem antes de ler a placa.");
      return;
    }

    setOcrStatus("loading");
    setOcrResult(null);

    try {
      const result = await requestParkFlowOCR({
        occurrenceId: `draft-${Date.now()}`,
        image: imageFile
      });
      setOcrResult(result);
      setOcrStatus("success");
      if (!form.plate.trim() && result.plate && result.plate !== "Nao identificada") {
        update("plate", result.plate);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel ler a placa.";
      setOcrStatus("error");
      setOcrError(message);
      onError?.(message);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.plate.trim() || !form.location.trim() || !form.description.trim()) {
      setError("Preencha placa, unidade/local e descricao para abrir a ocorrencia.");
      return;
    }
    onCreate({ ...form, photoUrl: photoUrls[0], photoUrls, aiResult });
    onClose();
  }

  const previewUrl = photoUrls[0];
  const canAnalyzeImage = Boolean(imageFile);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <motion.button
            aria-label="Fechar modal"
            className="absolute inset-0 cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl border border-line bg-[#07101f]/95 p-5 shadow-glow backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Fluxo de seguranca</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Nova ocorrencia</h2>
                <p className="mt-2 text-sm text-slate-400">Fluxo critico para incidente: risco, evidencias, alerta e timeline operacional.</p>
              </div>
              <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-slate-400 transition hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Car className="h-4 w-4 text-electric" />
                    Placa *
                  </span>
                  <input
                    value={form.plate}
                    onChange={(event) => update("plate", event.target.value)}
                    className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 font-mono uppercase text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                    placeholder="ABC1D23"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <MapPin className="h-4 w-4 text-electric" />
                    Unidade / local *
                  </span>
                  <input
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                    placeholder="Unidade, setor, cancela ou endereco"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 text-sm font-medium text-slate-300">Tipo</span>
                    <select value={form.type} onChange={(event) => update("type", event.target.value)} className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25">
                      <option value="PLACA_SUSPEITA">Placa suspeita</option>
                      <option value="ACESSO_NAO_AUTORIZADO">Acesso nao autorizado</option>
                      <option value="CONDUTA_SUSPEITA">Conduta suspeita</option>
                      <option value="INVASAO">Invasao</option>
                      <option value="COLISAO">Colisao</option>
                      <option value="VANDALISMO">Vandalismo</option>
                      <option value="DESACORDO_OPERACIONAL">Desacordo operacional</option>
                      <option value="EVASAO">Evasao</option>
                      <option value="FURTO_ROUBO">Furto/roubo</option>
                      <option value="DANO_PATRIMONIAL">Dano patrimonial</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 text-sm font-medium text-slate-300">Nivel de risco</span>
                    <select value={form.priority} onChange={(event) => update("priority", event.target.value as Priority)} className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25">
                      <option>BAIXA</option>
                      <option>MEDIA</option>
                      <option>ALTA</option>
                      <option>CRITICA</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 text-sm font-medium text-slate-300">Descricao inicial *</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => update("description", event.target.value)}
                    className="min-h-28 w-full resize-none rounded-lg border border-line bg-black/25 p-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                    placeholder="Resumo objetivo para a operacao"
                  />
                </label>
                {previousOccurrence ? (
                  <div className="rounded-xl border border-danger/35 bg-danger/10 p-4 text-sm leading-6 text-red-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                      <div>
                        <p className="font-semibold text-danger">Atenção: veículo com histórico de suspeita registrado anteriormente.</p>
                        <p className="mt-2 text-slate-300">
                          Unidade anterior: <span className="text-white">{previousOccurrence.location}</span> - Data:{" "}
                          <span className="text-white">{formatDate(previousOccurrence.reportedAt)}</span> - Tipo:{" "}
                          <span className="text-white">{typeLabel(previousOccurrence.type)}</span> - Risco:{" "}
                          <span className="text-white">{previousOccurrence.priority}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                {error ? <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <ShieldAlert className="h-4 w-4 text-warning" />
                  Evidencias e IA
                </div>
                <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-electric/35 bg-brand/10 p-4 text-center transition hover:bg-brand/15">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview da ocorrencia" className="h-44 w-full rounded-lg object-cover" />
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-electric" />
                      <p className="mt-3 text-sm font-semibold text-white">Anexar evidencias</p>
                      <p className="mt-1 text-xs text-slate-400">Múltiplas imagens. A ocorrencia pode ser salva sem IA.</p>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handlePhoto} className="hidden" />
                </label>
                {photoUrls.length > 1 ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {photoUrls.slice(1, 7).map((url, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={`${url}-${index}`} src={url} alt={`Evidencia ${index + 2}`} className="h-16 rounded-lg border border-line object-cover" />
                    ))}
                  </div>
                ) : null}

                <PremiumButton
                  type="button"
                  variant="primary"
                  onClick={analyzeWithAI}
                  disabled={!canAnalyzeImage || aiStatus === "loading"}
                  className="mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {aiStatus === "loading" ? "Analisando com IA..." : "Analisar com IA"}
                </PremiumButton>

                <div className="mt-3">
                  <AIAnalysisResultCard status={aiStatus} result={aiResult} message={aiError} />
                </div>

                <PremiumButton
                  type="button"
                  variant="secondary"
                  onClick={runOCR}
                  disabled={!canAnalyzeImage || ocrStatus === "loading"}
                  className="mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShieldAlert className="h-4 w-4" />
                  {ocrStatus === "loading" ? "Lendo placa..." : "Ler placa da imagem"}
                </PremiumButton>

                <div className="mt-3">
                  <OCRResultCard status={ocrStatus} result={ocrResult} message={ocrError} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <PremiumButton type="button" variant="secondary" onClick={onClose}>Cancelar</PremiumButton>
              <PremiumButton type="submit" variant="primary">Abrir incidente</PremiumButton>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
