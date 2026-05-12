"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PremiumButton } from "@/components/design-system";
import { Toast, type ToastState } from "@/components/toast";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@parkflow.com");
  const [password, setPassword] = useState("ParkFlow@2026");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setToast(null);
    try {
      await login(email, password);
      setToast({ type: "success", message: "Acesso autorizado. Abrindo central operacional." });
      window.setTimeout(() => router.push("/"), 520);
    } catch {
      setToast({ type: "error", message: "Nao foi possivel entrar. Verifique API, email e senha." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="operation-grid relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="noise-overlay" />
      <Toast toast={toast} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_430px]"
      >
        <section className="hidden min-h-[620px] rounded-2xl border border-line bg-slate-950/45 p-8 shadow-glow backdrop-blur-2xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-electric/35 bg-brand/20">
                <ShieldCheck className="h-6 w-6 text-electric" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">ParkFlow</p>
                <h1 className="text-2xl font-semibold text-white">Operational Intelligence</h1>
              </div>
            </div>
            <h2 className="mt-12 max-w-2xl text-5xl font-semibold leading-tight text-white">
              Uma central premium para sinistros, vistorias e decisoes rapidas.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
              Interface escura, fila operacional, timeline, upload de evidencias e IA aplicada ao fluxo real do operador.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: Radar, title: "Tempo real", text: "Prioridade e status na primeira dobra." },
              { icon: Sparkles, title: "IA assistiva", text: "Resumo, gravidade e proximo passo." },
              { icon: Lock, title: "Enterprise", text: "JWT, API e dados protegidos no backend." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-line bg-black/20 p-4">
                  <Icon className="h-5 w-5 text-electric" />
                  <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-electric/35 bg-brand/20">
              <ShieldCheck className="h-6 w-6 text-electric" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Acesso seguro</p>
              <h1 className="text-2xl font-semibold text-white">Entrar no ParkFlow</h1>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-line bg-black/25 px-3 text-white outline-none transition focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                type="email"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Senha</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-line bg-black/25 px-3 text-white outline-none transition focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                type="password"
              />
            </label>
          </div>

          <PremiumButton className="mt-7 w-full" variant="primary" disabled={loading}>
            <Lock className="h-4 w-4" />
            {loading ? "Validando..." : "Entrar na central"}
            <ArrowRight className="h-4 w-4" />
          </PremiumButton>

          <div className="mt-5 rounded-xl border border-line bg-black/20 p-4 text-xs leading-5 text-slate-500">
            Login local inicial: <span className="font-mono text-slate-300">admin@parkflow.com</span> /{" "}
            <span className="font-mono text-slate-300">ParkFlow@2026</span>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
