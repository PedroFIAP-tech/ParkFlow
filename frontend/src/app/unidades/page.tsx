"use client";

import { Building2, MapPin, Plus, Search, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PremiumButton, PremiumCard, SectionTitle } from "@/components/design-system";
import type { Unit } from "@/types/parkflow";

const STORAGE_KEY = "parkflow_security_units_v1";

const initialUnits: Unit[] = [
  { id: "unit-1", name: "Unidade Paulista", code: "UPA", type: "ESTACIONAMENTO", city: "Sao Paulo", address: "Av. Paulista, 1000", contactName: "Central Paulista", phone: "(11) 4000-1000" },
  { id: "unit-2", name: "Unidade Pinheiros", code: "UPI", type: "ESTACIONAMENTO", city: "Sao Paulo", address: "Rua dos Pinheiros, 600", contactName: "Supervisor Pinheiros", phone: "(11) 4000-2000" },
  { id: "unit-3", name: "Unidade Shopping Norte", code: "USN", type: "SHOPPING", city: "Sao Paulo", address: "Setor G2", contactName: "Operacao Norte", phone: "(11) 4000-3000" }
];

const emptyForm = {
  name: "",
  code: "",
  type: "ESTACIONAMENTO",
  city: "",
  address: "",
  contactName: "",
  phone: ""
};

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUnits(JSON.parse(stored) as Unit[]);
      return;
    }
    setUnits(initialUnits);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUnits));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return units.filter((unit) =>
      term
        ? [unit.name, unit.code, unit.type, unit.city, unit.address, unit.contactName].filter(Boolean).some((value) => value!.toLowerCase().includes(term))
        : true
    );
  }, [search, units]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.city.trim()) {
      return;
    }
    const next = [
      {
        id: `unit-${crypto.randomUUID()}`,
        ...form,
        code: form.code.trim().toUpperCase(),
        active: true
      },
      ...units
    ];
    setUnits(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setForm(emptyForm);
  }

  return (
    <AppShell title="Unidades" subtitle="Cadastro privado das operacoes monitoradas">
      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <PremiumCard className="p-5">
          <SectionTitle eyebrow="Cadastro" title="Nova unidade" />
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Nome" value={form.name} onChange={(value) => update("name", value)} placeholder="Unidade Paulista" />
            <Field label="Codigo" value={form.code} onChange={(value) => update("code", value)} placeholder="UPA" />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Tipo</span>
              <select
                value={form.type}
                onChange={(event) => update("type", event.target.value)}
                className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
              >
                <option>ESTACIONAMENTO</option>
                <option>CONDOMINIO</option>
                <option>SHOPPING</option>
                <option>CORPORATIVO</option>
                <option>LOGISTICA</option>
                <option>OUTROS</option>
              </select>
            </label>
            <Field label="Cidade" value={form.city} onChange={(value) => update("city", value)} placeholder="Sao Paulo" />
            <Field label="Endereco / setor" value={form.address} onChange={(value) => update("address", value)} placeholder="Entrada, torre ou setor" />
            <Field label="Responsavel" value={form.contactName} onChange={(value) => update("contactName", value)} placeholder="Supervisor da unidade" />
            <Field label="Telefone" value={form.phone} onChange={(value) => update("phone", value)} placeholder="(11) 4000-0000" />
            <PremiumButton type="submit" variant="primary" className="w-full">
              <Plus className="h-4 w-4" />
              Cadastrar unidade
            </PremiumButton>
          </form>
        </PremiumCard>

        <PremiumCard className="p-5">
          <SectionTitle eyebrow="Unidades ativas" title="Base operacional" />
          <div className="mt-5 flex h-12 items-center gap-3 rounded-xl border border-line bg-black/25 px-3">
            <Search className="h-5 w-5 text-electric" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar unidade, codigo, cidade ou responsavel"
              className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="mt-5 grid gap-3">
            {filtered.length ? (
              filtered.map((unit) => (
                <div key={unit.id} className="rounded-xl border border-line bg-black/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-sm text-electric">{unit.code}</p>
                      <h3 className="mt-1 text-xl font-semibold text-white">{unit.name}</h3>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="h-4 w-4" />
                        {unit.city} - {unit.address}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{unit.contactName} {unit.phone ? `- ${unit.phone}` : ""}</p>
                    </div>
                    <span className="inline-flex h-8 items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 text-xs font-semibold text-success">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      ATIVA
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Building2}
                title="Nenhuma unidade encontrada"
                description="Cadastre a primeira unidade ou ajuste o filtro de busca."
              />
            )}
          </div>
        </PremiumCard>
      </section>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
      />
    </label>
  );
}
