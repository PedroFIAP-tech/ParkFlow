"use client";

import { BarChart3, Car, Home, Plus, ScanLine } from "lucide-react";

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/92 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center text-slate-400">
        <button className="flex flex-col items-center gap-1 text-electric">
          <Home className="h-5 w-5" />
          <span className="text-[10px]">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Car className="h-5 w-5" />
          <span className="text-[10px]">Veiculos</span>
        </button>
        <button className="-mt-8 flex h-14 w-14 items-center justify-center justify-self-center rounded-full border border-electric/50 bg-brand text-white shadow-glow">
          <Plus className="h-7 w-7" />
        </button>
        <button className="flex flex-col items-center gap-1">
          <ScanLine className="h-5 w-5" />
          <span className="text-[10px]">Vistoria</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px]">BI</span>
        </button>
      </div>
    </nav>
  );
}

