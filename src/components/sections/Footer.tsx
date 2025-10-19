import React from "react";
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { GlassCard } from "../ui";

export const Footer: React.FC = () => (
  <motion.footer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="text-center py-8"
  >
    <GlassCard className="p-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <HiSparkles className="text-2xl text-indigo-600" />
        <h3 className="text-xl font-black text-slate-800">Regolamento</h3>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2 font-medium">
        <p>
          <strong>Punteggi base:</strong> 7-5-3-1 (4p), 7-4-2 (3p)
        </p>
        <p>
          <strong>Moltiplicatori:</strong> R1=×1, R2=×1, R3=×1.25, R4=×1.5
        </p>
        <p>
          <strong>Bonus:</strong> Hot Streak (+1 alla 2ª vittoria consecutiva), Arcinemico (+1 al
          3° incontro), Cap totale +3
        </p>
        <p>
          <strong>Tie-breakers:</strong> Punti totali → SOS → Vittorie → Head-to-head
        </p>
      </div>
      <p className="mt-6 text-xs text-slate-400 font-semibold">
        LOG League Dashboard · Big-Game Flavor · Powered by React + Framer Motion
      </p>
    </GlassCard>
  </motion.footer>
);
