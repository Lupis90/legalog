import React from "react";
import { motion } from "framer-motion";
import { HiPlay, HiDownload, HiTrash } from "react-icons/hi";
import { GlassCard, ModernButton } from "../ui";
import logoImage from "../../assets/WhatsApp Image 2025-01-24 at 12.34.40 (1).jpeg";

interface HeaderProps {
  onStartTournament: () => void;
  onExport: () => void;
  onClearData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartTournament, onExport, onClearData }) => (
  <motion.header
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="mb-12 relative"
  >
    <GlassCard className="p-8 md:p-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="rounded-2xl shadow-2xl overflow-hidden"
          >
            <img src={logoImage} alt="LOG League Logo" className="w-20 h-20 md:w-24 md:h-24 object-cover" />
          </motion.div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent pb-1 mb-2 leading-tight">
              The Log Open
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-semibold">Big-Game Flavor Dashboard</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <ModernButton variant="success" onClick={onStartTournament} icon={<HiPlay />}>
            Avvia R1
          </ModernButton>
          <ModernButton variant="secondary" onClick={onExport} icon={<HiDownload />}>
            Esporta
          </ModernButton>
          <ModernButton variant="danger" onClick={onClearData} icon={<HiTrash />}>
            Cancella Dati
          </ModernButton>
        </div>
      </div>
    </GlassCard>
  </motion.header>
);
