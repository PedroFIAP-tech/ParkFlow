"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function QuickAction({
  label,
  icon: Icon,
  primary,
  onClick
}: {
  label: string;
  icon: LucideIcon;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={
        primary
          ? "flex min-h-24 items-center gap-3 rounded-xl border border-electric/40 bg-brand px-4 text-left text-white shadow-glow transition hover:bg-blue-600"
          : "flex min-h-24 items-center gap-3 rounded-xl border border-line bg-slate-950/45 px-4 text-left text-slate-100 transition hover:border-electric/45 hover:bg-slate-900/70"
      }
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </motion.button>
  );
}
