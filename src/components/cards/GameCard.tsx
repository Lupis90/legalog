import { motion } from "framer-motion";
import type { Game } from "../../types";

interface GameCardProps {
  game: Game;
  onUpdate: (field: keyof Game, value: string | number) => void;
  onRemove: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onUpdate, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    className="group relative bg-gradient-to-br from-white to-purple-50/30 border-2 border-purple-100 hover:border-purple-300 rounded-2xl p-4 hover:shadow-xl transition-all duration-300"
  >
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <input
          className="flex-1 bg-transparent outline-none font-bold text-slate-800 text-lg placeholder-slate-400"
          value={game.title}
          placeholder="Titolo gioco"
          onChange={(e) => onUpdate("title", e.target.value)}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="px-3 py-2 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors font-semibold text-sm"
          onClick={onRemove}
        >
          Rimuovi
        </motion.button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <input
            className="w-24 bg-white/70 border-2 border-purple-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 transition-colors"
            value={game.duration}
            placeholder="30 min"
            onChange={(e) => onUpdate("duration", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          <input
            className="w-20 bg-white/70 border-2 border-purple-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 transition-colors"
            type="number"
            step="0.01"
            value={game.weight}
            onChange={(e) => onUpdate("weight", parseFloat(e.target.value || "0"))}
          />
        </div>
      </div>
    </div>
  </motion.div>
);
