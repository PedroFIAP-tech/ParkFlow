"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  FileImage,
  Home,
  ImagePlus,
  MapPin,
  PenLine,
  ShieldAlert,
  Sparkles,
  X,
  type LucideIcon
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

type Step = 1 | 2 | 3;
type PlateMode = "ia" | "manual";

const descriptionLimit = 300;

const unitOptions = ["Jardim Paulista", "Unidade Paulista", "Unidade Moema", "Unidade Itaim Bibi", "Unidade Jardins"];

const occurrenceTypes = [
  { value: "FURTO_ROUBO", label: "Tentativa de furto" },
  { value: "PLACA_SUSPEITA", label: "Veículo suspeito" },
  { value: "CONDUTA_SUSPEITA", label: "Comportamento suspeito" },
  { value: "ACESSO_NAO_AUTORIZADO", label: "Acesso não autorizado" },
  { value: "INVASAO", label: "Invasão de área restrita" },
  { value: "COLISAO", label: "Colisão operacional" },
  { value: "VANDALISMO", label: "Vandalismo" },
  { value: "EVASAO", label: "Evasão" },
  { value: "DANO_PATRIMONIAL", label: "Dano patrimonial" },
  { value: "DESACORDO_OPERACIONAL", label: "Desacordo operacional" },
  { value: "OUTROS", label: "Outros" }
];

function buildEmptyForm() {
  return {
    plate: "",
    type: "FURTO_ROUBO",
    location: "Jardim Paulista",
    priority: "ALTA" as Priority,
    reportedAt: currentLocalDateTime(),
    description: ""
  };
}

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
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [plateMode, setPlateMode] = useState<PlateMode>("ia");
  const [form, setForm] = useState(buildEmptyForm);
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
      setStep(1);
      setPlateMode("ia");
      setForm(buildEmptyForm());
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

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.classList.add("parkflow-modal-open");
    return () => document.body.classList.remove("parkflow-modal-open");
  }, [open]);

  const plateHistory = useMemo(() => getPlateHistory(occurrences, form.plate), [form.plate, occurrences]);
  const previousOccurrence = plateHistory[0];
  const canAnalyzeImage = Boolean(imageFile);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({
      ...current,
      [key]: key === "description" && typeof value === "string" ? value.slice(0, descriptionLimit) : value
    }));
    setError("");

    if (key === "plate" || key === "description" || key === "type") {
      setAiStatus((current) => (current === "success" ? "idle" : current));
      setAiResult(null);
      setAiError("");
    }
  }

  function handleEvidence(event: ChangeEvent<HTMLInputElement>) {
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

    event.target.value = "";
  }

  async function handleCameraCapture(dataUrl: string) {
    const file = await dataUrlToFile(dataUrl, `placa-camera-${Date.now()}.jpg`);
    setImageFile(file);
    setPhotoUrls((current) => [dataUrl, ...current]);
    setAiStatus("idle");
    setAiResult(null);
    setAiError("");
    setOcrStatus("idle");
    setOcrResult(null);
    setOcrError("");
  }

  function validateDataStep() {
    if (!form.location.trim() || !form.type || !form.reportedAt || !form.description.trim()) {
      setError("Preencha unidade, tipo, data/hora e descrição para continuar.");
      return false;
    }

    if (plateMode === "manual" && !form.plate.trim()) {
      setError("Digite a placa ou escolha leitura por IA para continuar com a câmera.");
      return false;
    }

    return true;
  }

  function goToEvidence() {
    if (!validateDataStep()) {
      return;
    }
    setError("");
    setStep(2);
  }

  function goToSummary() {
    if (!validateDataStep()) {
      setStep(1);
      return;
    }
    setError("");
    setStep(3);
  }

  async function analyzeWithAI() {
    setError("");
    setAiError("");

    if (!imageFile) {
      setAiStatus("error");
      setAiError("Adicione uma imagem da câmera ou galeria antes de analisar.");
      return;
    }

    setAiStatus("loading");
    setAiResult(null);

    try {
      const result = await requestParkFlowAI({
        occurrenceId: `draft-${Date.now()}`,
        plate: form.plate,
        description: form.description || "Análise auxiliar de evidência de segurança operacional.",
        image: imageFile
      });
      setAiResult(result);
      setAiStatus("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível analisar a imagem.";
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
      setOcrError("Adicione uma imagem da câmera ou galeria antes de ler a placa.");
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
      if (result.plate && result.plate !== "Nao identificada") {
        update("plate", result.plate);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível ler a placa.";
      setOcrStatus("error");
      setOcrError(message);
      onError?.(message);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateDataStep()) {
      setStep(1);
      return;
    }

    if (!form.plate.trim()) {
      setError("Informe a placa manualmente ou use a leitura por IA antes de finalizar.");
      setStep(2);
      return;
    }

    onCreate({
      ...form,
      plate: form.plate.trim().toUpperCase(),
      reportedAt: new Date(form.reportedAt).toISOString(),
      photoUrl: photoUrls[0],
      photoUrls,
      aiResult
    });
    onClose();
    router.replace("/");
  }

  function closeOrBack() {
    if (step === 1) {
      onClose();
      return;
    }
    setError("");
    setStep((current) => (current === 3 ? 2 : 1));
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <motion.button
            aria-label="Fechar modal"
            className="absolute inset-0 hidden cursor-default sm:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-dvh w-full flex-col overflow-hidden border border-line bg-[#07101f]/98 shadow-glow backdrop-blur-2xl sm:max-h-[92vh] sm:max-w-2xl sm:rounded-2xl"
          >
            <header className="border-b border-line bg-[#07101f]/95 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-5 sm:pt-5">
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={closeOrBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 text-center">
                  <p className="truncate text-base font-semibold text-white">{step === 2 ? "Evidências" : step === 3 ? "Resumo da Ocorrência" : "Nova Ocorrência"}</p>
                  <p className="text-xs text-slate-500">Fluxo operacional em 3 etapas</p>
                </div>
                <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.06] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <StepIndicator step={step} />
            </header>

            <div className="premium-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-5 sm:px-5">
              {step === 1 ? (
                <DataStep
                  form={form}
                  plateMode={plateMode}
                  previousOccurrence={previousOccurrence}
                  onPlateMode={setPlateMode}
                  onUpdate={update}
                  onNext={goToEvidence}
                />
              ) : null}

              {step === 2 ? (
                <EvidenceStep
                  photoUrls={photoUrls}
                  canAnalyzeImage={canAnalyzeImage}
                  aiStatus={aiStatus}
                  aiResult={aiResult}
                  aiError={aiError}
                  ocrStatus={ocrStatus}
                  ocrResult={ocrResult}
                  ocrError={ocrError}
                  onEvidence={handleEvidence}
                  onCameraCapture={handleCameraCapture}
                  onOCR={runOCR}
                  onAnalyze={analyzeWithAI}
                />
              ) : null}

              {step === 3 ? (
                <SummaryStep
                  form={form}
                  photoCount={photoUrls.length}
                  plateHistory={plateHistory}
                  previousOccurrence={previousOccurrence}
                  aiResult={aiResult}
                />
              ) : null}
            </div>

            <footer className="absolute inset-x-0 bottom-0 border-t border-line bg-[#07101f]/96 px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-5">
              {error ? <p className="mb-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
              <div className="flex gap-3">
                {step === 1 ? (
                  <PremiumButton type="button" variant="primary" onClick={goToEvidence} className="hidden w-full sm:inline-flex">
                    Próximo
                  </PremiumButton>
                ) : null}

                {step === 2 ? (
                  <>
                    <PremiumButton type="button" variant="secondary" onClick={() => setStep(1)} className="w-28">
                      Voltar
                    </PremiumButton>
                    <PremiumButton type="button" variant="primary" onClick={goToSummary} className="flex-1">
                      Próximo
                    </PremiumButton>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <PremiumButton type="button" variant="secondary" onClick={() => setStep(2)} className="w-28">
                      Voltar
                    </PremiumButton>
                    <PremiumButton type="submit" variant="primary" className="flex-1">
                      <Home className="h-4 w-4" />
                      Criar e ir para home
                    </PremiumButton>
                  </>
                ) : null}
              </div>
            </footer>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Array<{ id: Step; label: string }> = [
    { id: 1, label: "Dados" },
    { id: 2, label: "Evidências" },
    { id: 3, label: "Resumo" }
  ];

  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      {steps.map((item) => {
        const active = step === item.id;
        const done = step > item.id;
        return (
          <div key={item.id} className="flex flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span className={clsx("h-0.5 flex-1", item.id === 1 ? "bg-transparent" : done || active ? "bg-brand" : "bg-white/10")} />
              <span
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  active || done ? "bg-brand text-white shadow-[0_0_24px_rgba(31,111,235,0.5)]" : "bg-white/10 text-slate-500"
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : item.id}
              </span>
              <span className={clsx("h-0.5 flex-1", item.id === 3 ? "bg-transparent" : step > item.id ? "bg-brand" : "bg-white/10")} />
            </div>
            <span className={clsx("text-xs font-semibold", active ? "text-white" : "text-slate-500")}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DataStep({
  form,
  plateMode,
  previousOccurrence,
  onPlateMode,
  onUpdate,
  onNext
}: {
  form: ReturnType<typeof buildEmptyForm>;
  plateMode: PlateMode;
  previousOccurrence?: OccurrenceDetail;
  onPlateMode: (mode: PlateMode) => void;
  onUpdate: <K extends keyof ReturnType<typeof buildEmptyForm>>(key: K, value: ReturnType<typeof buildEmptyForm>[K]) => void;
  onNext: () => void;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white">Dados da Ocorrência</h2>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-400">Unidade</span>
          <input
            list="parkflow-unit-options"
            value={form.location}
            onChange={(event) => onUpdate("location", event.target.value)}
            placeholder="Unidade, setor ou cancela"
            className="h-12 w-full rounded-lg border border-line bg-white/[0.04] px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
          />
          <datalist id="parkflow-unit-options">
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-400">Tipo de Ocorrência</span>
          <select
            value={form.type}
            onChange={(event) => onUpdate("type", event.target.value)}
            className="h-12 w-full rounded-lg border border-line bg-white/[0.04] px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
          >
            {occurrenceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-400">Nível de risco</span>
          <select
            value={form.priority}
            onChange={(event) => onUpdate("priority", event.target.value as Priority)}
            className="h-12 w-full rounded-lg border border-line bg-white/[0.04] px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
          >
            <option value="BAIXA">Baixo</option>
            <option value="MEDIA">Médio</option>
            <option value="ALTA">Alto</option>
            <option value="CRITICA">Crítico</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-400">Data e Hora</span>
          <div className="flex h-12 items-center gap-3 rounded-lg border border-line bg-white/[0.04] px-3 focus-within:border-electric/60 focus-within:ring-2 focus-within:ring-electric/25">
            <input
              type="datetime-local"
              value={form.reportedAt}
              onChange={(event) => onUpdate("reportedAt", event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
            />
            <CalendarDays className="h-4 w-4 text-slate-500" />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-400">Descrição</span>
          <textarea
            value={form.description}
            onChange={(event) => onUpdate("description", event.target.value)}
            className="min-h-24 w-full resize-none rounded-lg border border-line bg-white/[0.04] p-3 text-white outline-none placeholder:text-slate-600 focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
            placeholder="Descreva os detalhes da ocorrência..."
          />
          <span className="mt-1 block text-right text-xs text-slate-500">
            {form.description.length}/{descriptionLimit}
          </span>
        </label>
      </div>

      <div className="mt-5">
        <h3 className="text-base font-semibold text-white">Placa do Veículo</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onPlateMode("ia")}
            className={clsx(
              "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-3 text-center transition active:scale-95",
              plateMode === "ia" ? "border-electric/40 bg-brand text-white shadow-[0_16px_38px_rgba(31,111,235,0.28)]" : "border-line bg-white/[0.04] text-slate-400"
            )}
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs font-semibold">Ler Placa (IA)</span>
          </button>
          <button
            type="button"
            onClick={() => onPlateMode("manual")}
            className={clsx(
              "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-3 text-center transition active:scale-95",
              plateMode === "manual" ? "border-electric/40 bg-brand text-white shadow-[0_16px_38px_rgba(31,111,235,0.28)]" : "border-line bg-white/[0.04] text-slate-400"
            )}
          >
            <PenLine className="h-5 w-5" />
            <span className="text-xs font-semibold">Digitar Manualmente</span>
          </button>
        </div>

        {(plateMode === "manual" || form.plate) ? (
          <label className="mt-3 block">
            <input
              value={form.plate}
              onChange={(event) => onUpdate("plate", event.target.value.toUpperCase())}
              className="h-12 w-full rounded-lg border border-line bg-white/[0.04] px-3 font-mono uppercase text-white outline-none placeholder:text-slate-600 focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
              placeholder="ABC1D23"
            />
          </label>
        ) : null}
      </div>

      {previousOccurrence ? (
        <HistoryAlert occurrence={previousOccurrence} />
      ) : null}

      <PremiumButton type="button" variant="primary" onClick={onNext} className="mt-5 w-full sm:hidden">
        Próximo
      </PremiumButton>
    </section>
  );
}

function EvidenceStep({
  photoUrls,
  canAnalyzeImage,
  aiStatus,
  aiResult,
  aiError,
  ocrStatus,
  ocrResult,
  ocrError,
  onEvidence,
  onCameraCapture,
  onOCR,
  onAnalyze
}: {
  photoUrls: string[];
  canAnalyzeImage: boolean;
  aiStatus: AIAnalysisStatus;
  aiResult: ParkFlowAIResult | null;
  aiError: string;
  ocrStatus: AIAnalysisStatus;
  ocrResult: ParkFlowOCRResult | null;
  ocrError: string;
  onEvidence: (event: ChangeEvent<HTMLInputElement>) => void;
  onCameraCapture: (dataUrl: string) => void | Promise<void>;
  onOCR: () => void;
  onAnalyze: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<"loading" | "ready" | "error">("loading");
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      setCameraStatus("loading");
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus("error");
        setCameraError("Câmera indisponível neste navegador. Use fotos da galeria.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setCameraStatus("ready");
      } catch {
        if (!mounted) {
          return;
        }
        setCameraStatus("error");
        setCameraError("Permissão da câmera não concedida. Libere a câmera ou use fotos da galeria.");
      }
    }

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || cameraStatus !== "ready") {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    await onCameraCapture(canvas.toDataURL("image/jpeg", 0.92));
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-white">Evidências</h2>
      <p className="mt-1 text-sm leading-6 text-slate-400">A câmera será aberta para registrar a placa. Como alternativa, suba uma foto da galeria.</p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-black/25">
        <div className="relative h-72 overflow-hidden bg-black">
          <video ref={videoRef} autoPlay muted playsInline className={clsx("h-full w-full object-cover", cameraStatus === "ready" ? "opacity-100" : "opacity-20")} />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="relative h-40 w-full max-w-sm rounded-2xl border border-dashed border-electric/35">
              <span className="absolute left-4 top-4 h-9 w-9 rounded-tl-xl border-l-4 border-t-4 border-electric" />
              <span className="absolute right-4 top-4 h-9 w-9 rounded-tr-xl border-r-4 border-t-4 border-electric" />
              <span className="absolute bottom-4 left-4 h-9 w-9 rounded-bl-xl border-b-4 border-l-4 border-electric" />
              <span className="absolute bottom-4 right-4 h-9 w-9 rounded-br-xl border-b-4 border-r-4 border-electric" />
            </div>
          </div>

          {cameraStatus !== "ready" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center">
              <Camera className="h-10 w-10 text-electric" />
              <p className="mt-4 text-sm font-semibold text-white">{cameraStatus === "loading" ? "Solicitando permissão da câmera..." : "Câmera não disponível"}</p>
              {cameraError ? <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">{cameraError}</p> : null}
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={cameraStatus !== "ready"}
              className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-full border border-electric/40 bg-brand px-5 text-sm font-bold text-white shadow-[0_18px_42px_rgba(31,111,235,0.38)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="h-5 w-5" />
              Tirar foto
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <label className="flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-line bg-white/[0.04] px-3 text-center text-slate-300 transition hover:bg-white/[0.06] active:scale-95">
          <ImagePlus className="h-5 w-5 text-electric" />
          <span className="text-xs font-semibold">Fotos da galeria</span>
          <input type="file" accept="image/*" multiple onChange={onEvidence} className="hidden" />
        </label>
      </div>

      {photoUrls.length ? (
        <div className="mt-4 rounded-xl border border-line bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <FileImage className="h-4 w-4 text-electric" />
              {photoUrls.length} foto(s) anexada(s)
            </div>
            <span className="text-xs text-slate-500">Câmera / galeria</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {photoUrls.slice(0, 8).map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${url}-${index}`} src={url} alt={`Evidência ${index + 1}`} className="h-16 rounded-lg border border-line object-cover" />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <PremiumButton type="button" variant="secondary" onClick={onOCR} disabled={!canAnalyzeImage || ocrStatus === "loading"} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
          <ShieldAlert className="h-4 w-4" />
          {ocrStatus === "loading" ? "Lendo placa..." : "Ler placa da evidência"}
        </PremiumButton>
        <OCRResultCard status={ocrStatus} result={ocrResult} message={ocrError} />

        <PremiumButton type="button" variant="primary" onClick={onAnalyze} disabled={!canAnalyzeImage || aiStatus === "loading"} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
          <Sparkles className="h-4 w-4" />
          {aiStatus === "loading" ? "Analisando..." : "Analisar evidência"}
        </PremiumButton>
        <AIAnalysisResultCard status={aiStatus} result={aiResult} message={aiError} />
      </div>
    </section>
  );
}

function SummaryStep({
  form,
  photoCount,
  plateHistory,
  previousOccurrence,
  aiResult
}: {
  form: ReturnType<typeof buildEmptyForm>;
  photoCount: number;
  plateHistory: OccurrenceDetail[];
  previousOccurrence?: OccurrenceDetail;
  aiResult: ParkFlowAIResult | null;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-line bg-white/[0.06] px-3 py-1 font-mono text-xl font-black text-white">
          {form.plate || "PLACA PENDENTE"}
        </span>
        <span className={clsx("rounded-lg border px-3 py-1 text-xs font-black", previousOccurrence ? "border-danger/30 bg-danger/10 text-danger" : "border-electric/30 bg-brand/10 text-blue-100")}>
          {previousOccurrence ? "ALTO RISCO" : form.priority}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-black/20 p-4">
        <h2 className="text-lg font-semibold text-white">Resumo</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-300">
          <SummaryRow icon={MapPin} label="Unidade" value={form.location} />
          <SummaryRow icon={ShieldAlert} label="Tipo" value={occurrenceTypeLabel(form.type)} />
          <SummaryRow icon={Clock3} label="Data/Hora" value={formatDateTime(form.reportedAt)} />
          <SummaryRow icon={FileImage} label="Evidências" value={`${photoCount} foto(s)`} />
        </div>
        <p className="mt-4 rounded-xl border border-line bg-white/[0.03] p-3 text-sm leading-6 text-slate-300">{form.description}</p>
        {aiResult ? <p className="mt-3 rounded-xl border border-brand/25 bg-brand/10 p-3 text-sm leading-6 text-blue-100">{aiResult.summary}</p> : null}
      </div>

      <div className="mt-5">
        <h2 className="text-lg font-semibold text-white">Histórico da Placa</h2>
        {plateHistory.length ? (
          <div className="mt-4 space-y-0">
            {plateHistory.map((occurrence, index) => (
              <HistoryItem key={occurrence.id} occurrence={occurrence} isLast={index === plateHistory.length - 1} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-line bg-black/20 p-5 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
            <p className="mt-3 font-semibold text-white">Nenhum histórico anterior encontrado</p>
            <p className="mt-1 text-sm text-slate-500">A ocorrência será criada como primeira aparição dessa placa.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function HistoryAlert({ occurrence }: { occurrence: OccurrenceDetail }) {
  return (
    <div className="mt-5 rounded-xl border border-danger/35 bg-danger/10 p-4 text-sm leading-6 text-red-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="font-semibold text-danger">Atenção: veículo com histórico de suspeita registrado anteriormente.</p>
          <p className="mt-2 text-slate-300">
            Unidade anterior: <span className="text-white">{occurrence.location}</span> - Data:{" "}
            <span className="text-white">{formatDateTime(occurrence.reportedAt)}</span> - Tipo:{" "}
            <span className="text-white">{typeLabel(occurrence.type)}</span> - Risco: <span className="text-white">{occurrence.priority}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ occurrence, isLast }: { occurrence: OccurrenceDetail; isLast: boolean }) {
  const tone = priorityTone(occurrence.priority);

  return (
    <div className="grid grid-cols-[24px_1fr_auto] gap-3">
      <div className="flex flex-col items-center">
        <span className={clsx("mt-1 h-4 w-4 rounded-full border-2 border-[#07101f]", tone.dot)} />
        {!isLast ? <span className={clsx("mt-1 w-0.5 flex-1", tone.line)} /> : null}
      </div>
      <div className="pb-5">
        <p className="text-sm font-semibold text-slate-300">{formatDateTime(occurrence.reportedAt)}</p>
        <p className="mt-1 font-semibold text-white">{typeLabel(occurrence.type)}</p>
        <p className="mt-1 text-sm text-slate-500">{occurrence.location}</p>
      </div>
      <span className={clsx("mt-1 h-8 rounded-lg border px-3 py-1 text-xs font-black", tone.badge)}>{occurrence.priority}</span>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-electric" />
      <span className="w-24 shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 truncate text-right font-medium text-slate-200">{value}</span>
    </div>
  );
}

function priorityTone(priority: Priority) {
  const tones: Record<Priority, { dot: string; line: string; badge: string }> = {
    BAIXA: {
      dot: "bg-success",
      line: "bg-success/40",
      badge: "border-success/30 bg-success/10 text-success"
    },
    MEDIA: {
      dot: "bg-warning",
      line: "bg-warning/40",
      badge: "border-warning/30 bg-warning/10 text-warning"
    },
    ALTA: {
      dot: "bg-orange-400",
      line: "bg-orange-400/40",
      badge: "border-orange-400/30 bg-orange-400/10 text-orange-300"
    },
    CRITICA: {
      dot: "bg-danger",
      line: "bg-danger/40",
      badge: "border-danger/35 bg-danger/10 text-danger"
    }
  };
  return tones[priority];
}

function occurrenceTypeLabel(type: string) {
  return occurrenceTypes.find((item) => item.value === type)?.label ?? typeLabel(type);
}

function currentLocalDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

async function dataUrlToFile(dataUrl: string, filename: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}
