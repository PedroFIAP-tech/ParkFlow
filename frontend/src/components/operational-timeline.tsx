"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { SectionTitle } from "@/components/design-system";
import type { TimelineEvent } from "@/types/parkflow";

export function OperationalTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="glass-panel rounded-xl p-5">
      <SectionTitle eyebrow="Rastreabilidade" title="Timeline operacional" />
      <div className="mt-5 space-y-5">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.045 }}
            className="relative border-l border-line pl-5"
          >
            <span className="absolute -left-[10px] top-0 flex h-5 w-5 items-center justify-center rounded-full border border-electric/30 bg-ink">
              <Activity className="h-3 w-3 text-electric" />
            </span>
            <p className="text-sm font-semibold text-white">{event.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{event.description}</p>
            <p className="mt-2 text-xs text-slate-600">{event.createdBy}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

