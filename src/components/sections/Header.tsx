import React from "react";
import { motion } from "framer-motion";
import { HiPlay, HiDownload } from "react-icons/hi";
import { FaTrophy } from "react-icons/fa";
import { GlassCard, ModernButton } from "../ui";

interface HeaderProps {
  onStartTournament: () => void;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartTournament, onExport }) => (
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
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="p-5 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-600 rounded-3xl shadow-2xl"
          >
            <FaTrophy className="text-5xl text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
              LOG League
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-semibold">Big-Game Flavor Dashboard</p>
          </div>
        </div>
        <div className="flex gap-4">
          <ModernButton variant="success" onClick={onStartTournament} icon={<HiPlay />}>
            Avvia R1
          </ModernButton>
          <ModernButton variant="secondary" onClick={onExport} icon={<HiDownload />}>
            Esporta
          </ModernButton>
        </div>
      </div>
    </GlassCard>
  </motion.header>
);
