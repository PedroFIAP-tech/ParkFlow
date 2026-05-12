"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function MetricCard({
  label,
  value,
  tone,
  icon: Icon
}: {
  label: string;
  value: number | string;
  tone: string;
  icon: LucideIcon;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} className="glass-panel rounded-xl p-4 transition hover:border-electric/35">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <strong className="mt-2 block text-2xl font-semibold text-white">{value}</strong>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
