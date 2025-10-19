import { motion } from "framer-motion";
import type { Player } from "../../types";

interface PlayerCardProps {
  player: Player;
  index: number;
  onNameChange: (name: string) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, index, onNameChange }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className="group relative bg-gradient-to-br from-white to-indigo-50/30 border-2 border-indigo-100 hover:border-indigo-300 rounded-2xl p-4 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 text-sm font-black text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
        {index + 1}
      </div>
      <input
        className="flex-1 bg-transparent outline-none font-semibold text-slate-800 placeholder-slate-400 text-lg"
        value={player.name}
        placeholder="Nome giocatore"
        onChange={(e) => onNameChange(e.target.value)}
      />
    </div>
  </motion.div>
);
