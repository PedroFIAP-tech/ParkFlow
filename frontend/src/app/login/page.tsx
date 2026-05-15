"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Mail,
  Radar,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { PremiumButton } from "@/components/design-system";
import { Toast, type ToastState } from "@/components/toast";
import { login } from "@/lib/api";

const accessNotes = [
  { icon: UserCheck, label: "Supervisores provisionados" },
  { icon: LockKeyhole, label: "Sem cadastro público" },
  { icon: ShieldCheck, label: "Sessão protegida por token" }
];

const operationSignals = [
  { label: "Unidades online", value: "12", tone: "text-success" },
  { label: "Alertas ativos", value: "8", tone: "text-danger" },
  { label: "IA operacional", value: "98%", tone: "text-electric" }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setToast({ type: "error", message: "Informe e-mail e senha para acessar a central." });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      await login(normalizedEmail, password);
      setToast({ type: "success", message: "Acesso autorizado. Abrindo central operacional." });
      window.setTimeout(() => router.replace("/"), 420);
    } catch {
      setToast({
        type: "error",
        message: "Acesso negado. Verifique e-mail, senha ou liberação do supervisor."
      });
      setLoading(false);
    }
  }

  return (
    <main className="operation-grid relative min-h-screen overflow-hidden bg-ink px-4 py-[calc(18px_+_env(safe-area-inset-top))] text-white sm:px-6 lg:px-8">
      <div className="noise-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,111,235,0.26),transparent_30rem),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.12),transparent_22rem),linear-gradient(180deg,rgba(5,7,13,0.05),rgba(5,7,13,0.88))]" />
      <Toast toast={toast} />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh_-_36px_-_env(safe-area-inset-top))] w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">
        <motion.section
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="hidden min-h-[640px] overflow-hidden rounded-3xl border border-line bg-[#07101f]/80 p-7 shadow-glow backdrop-blur-2xl lg:flex lg:flex-col lg:justify-between"
        >
          <div>
            <BrandLogo className="h-14 w-72" priority />
            <div className="mt-12 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-electric/25 bg-electric/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-electric">
                <Radar className="h-4 w-4" />
                Central privada
              </div>
              <h1 className="mt-5 text-5xl font-semibold leading-tight text-white">
                Controle operacional para supervisores SmartPark.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
                Acesso restrito para equipes cadastradas pela administração. A operação abre direto no painel, sem fluxo público de cadastro.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-electric/20 bg-slate-950/70">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(66,165,255,0.18),transparent_23rem)]" />
              <div className="absolute left-7 top-7 flex items-center gap-3 rounded-2xl border border-success/25 bg-success/10 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-success">Autorizado</p>
                  <p className="text-sm text-slate-200">Supervisor validado</p>
                </div>
              </div>

              <div className="absolute inset-x-10 top-1/2 h-px bg-electric/70 shadow-[0_0_28px_rgba(66,165,255,0.85)]" />
              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-electric/20 bg-electric/10 blur-sm" />
              <Fingerprint className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-electric" />

              <div className="absolute bottom-7 left-7 right-7 grid grid-cols-3 gap-3">
                {operationSignals.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-line bg-black/35 p-4 backdrop-blur">
                    <p className={`text-2xl font-bold ${item.tone}`}>{item.value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-3xl border border-line bg-[#08111f]/90 p-5 shadow-glow backdrop-blur-2xl sm:p-7"
        >
          <div className="lg:hidden">
            <BrandLogo className="h-12 w-64 max-w-full" priority />
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-electric/25 bg-electric/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-electric">
              <Activity className="h-4 w-4" />
              Acesso operacional
            </div>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Entrar na central
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              Use as credenciais liberadas pela administração. Novos supervisores devem ser cadastrados diretamente no banco.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">E-mail do supervisor</span>
              <div className="mt-2 flex h-14 items-center gap-3 rounded-2xl border border-line bg-black/25 px-4 transition focus-within:border-electric/60 focus-within:ring-2 focus-within:ring-electric/20">
                <Mail className="h-5 w-5 shrink-0 text-slate-500" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="supervisor@empresa.com"
                  className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Senha</span>
              <div className="mt-2 flex h-14 items-center gap-3 rounded-2xl border border-line bg-black/25 px-4 transition focus-within:border-electric/60 focus-within:ring-2 focus-within:ring-electric/20">
                <KeyRound className="h-5 w-5 shrink-0 text-slate-500" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Senha de acesso"
                  className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            <div className="rounded-2xl border border-line bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-electric" />
                <div>
                  <p className="font-semibold text-white">Acesso provisionado</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Esta tela não cria usuários. O login só é autorizado para supervisores cadastrados pela operação.
                  </p>
                </div>
              </div>
            </div>

            <PremiumButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="h-14 w-full rounded-2xl text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Validando acesso..." : "Acessar central"}
              {!loading ? <ArrowRight className="h-5 w-5" /> : null}
            </PremiumButton>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {accessNotes.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-line bg-black/20 px-3 py-3 text-sm font-medium text-slate-300">
                  <Icon className="h-4 w-4 shrink-0 text-electric" />
                  <span className="min-w-0 leading-5">{item.label}</span>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
