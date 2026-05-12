"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, Car, MapPin, ShieldAlert, Sparkles, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
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
import type { NewOccurrenceInput } from "@/lib/occurrence-store";
import type { Priority } from "@/types/parkflow";

const emptyForm = {
  plate: "",
  type: "COLISAO",
  location: "",
  priority: "MEDIA" as Priority,
  description: ""
};

export function NewOccurrenceModal({
  open,
  onClose,
  onCreate,
  onError
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewOccurrenceInput) => void;
  onError?: (message: string) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
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
      setPhotoUrl("");
      setImageFile(null);
      setAiStatus("idle");
      setAiResult(null);
      setAiError("");
      setOcrStatus("idle");
      setOcrResult(null);
      setOcrError("");
    }
  }, [open]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "plate" || key === "description") {
      setAiStatus((current) => (current === "success" ? "idle" : current));
      setAiResult(null);
      setAiError("");
    }
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(String(reader.result));
      setAiStatus("idle");
      setAiResult(null);
      setAiError("");
      setOcrStatus("idle");
      setOcrResult(null);
      setOcrError("");
    };
    reader.readAsDataURL(file);
  }

  async function analyzeWithAI() {
    setError("");
    setAiError("");

    if (!imageFile) {
      setAiStatus("error");
      setAiError("Selecione uma imagem antes de analisar com IA.");
      return;
    }

    if (!form.plate.trim() || !form.description.trim()) {
      const message = "Informe placa e descricao antes de acionar a IA.";
      setError(message);
      setAiStatus("error");
      setAiError(message);
      onError?.(message);
      return;
    }

    setAiStatus("loading");
    setAiResult(null);

    try {
      const result = await requestParkFlowAI({
        occurrenceId: `draft-${Date.now()}`,
        plate: form.plate,
        description: form.description,
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
      setOcrError("Selecione uma imagem antes de executar OCR.");
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
      const message = err instanceof Error ? err.message : "Nao foi possivel executar OCR.";
      setOcrStatus("error");
      setOcrError(message);
      onError?.(message);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.plate.trim() || !form.location.trim() || !form.description.trim()) {
      setError("Preencha placa, local e descricao para abrir a ocorrencia.");
      return;
    }
    onCreate({ ...form, photoUrl, aiResult });
    onClose();
  }

  const previewUrl = photoUrl;
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Fluxo rapido</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Nova ocorrencia</h2>
                <p className="mt-2 text-sm text-slate-400">Registre o essencial para colocar o caso na fila operacional.</p>
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
                    Local *
                  </span>
                  <input
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                    placeholder="Unidade, patio ou endereco"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 text-sm font-medium text-slate-300">Tipo</span>
                    <select value={form.type} onChange={(event) => update("type", event.target.value)} className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25">
                      <option>COLISAO</option>
                      <option>AVARIA</option>
                      <option>PANE</option>
                      <option>ROUBO</option>
                      <option>DOCUMENTACAO</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 text-sm font-medium text-slate-300">Prioridade</span>
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
                {error ? <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <ShieldAlert className="h-4 w-4 text-warning" />
                  Foto e IA
                </div>
                <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-electric/35 bg-brand/10 p-4 text-center transition hover:bg-brand/15">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview da ocorrencia" className="h-44 w-full rounded-lg object-cover" />
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-electric" />
                      <p className="mt-3 text-sm font-semibold text-white">Anexar foto</p>
                      <p className="mt-1 text-xs text-slate-400">Aceita imagem e gera preview.</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </label>

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
                  {ocrStatus === "loading" ? "Executando OCR..." : "Ler placa / OCR"}
                </PremiumButton>

                <div className="mt-3">
                  <OCRResultCard status={ocrStatus} result={ocrResult} message={ocrError} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <PremiumButton type="button" variant="secondary" onClick={onClose}>Cancelar</PremiumButton>
              <PremiumButton type="submit" variant="primary">Abrir ocorrencia</PremiumButton>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
