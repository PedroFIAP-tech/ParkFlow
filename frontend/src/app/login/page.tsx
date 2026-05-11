"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@parkflow.com");
  const [password, setPassword] = useState("ParkFlow@2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError("Nao foi possivel entrar. Verifique API, email e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="operation-grid flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-electric/35 bg-brand/20">
            <ShieldCheck className="h-6 w-6 text-electric" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Acesso seguro</p>
            <h1 className="text-2xl font-semibold text-white">ParkFlow</h1>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
              type="email"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Senha</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
              type="password"
            />
          </label>
        </div>

        {error ? <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}

        <button className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand font-semibold text-white transition hover:bg-blue-600">
          <Lock className="h-4 w-4" />
          {loading ? "Entrando..." : "Entrar na central"}
        </button>
      </form>
    </main>
  );
}
