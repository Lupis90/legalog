import { motion, AnimatePresence } from "framer-motion";
import { HiSparkles, HiExclamation } from "react-icons/hi";
import type { TableResult, Player, Game } from "../../types";
import { ModernButton } from "../ui";

interface TableCardProps {
  table: TableResult;
  playerMap: Record<string, Player>;
  games: Game[];
  hasRepeatWarning: boolean;
  onGameChange: (game: string) => void;
  onPositionChange: (playerId: string, position: number | null) => void;
  onSuggestGame: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  playerMap,
  games,
  hasRepeatWarning,
  onGameChange,
  onPositionChange,
  onSuggestGame,
}) => {
  const tableGradients = {
    A: "from-rose-500 via-red-500 to-pink-600",
    B: "from-blue-500 via-indigo-500 to-purple-600",
    C: "from-emerald-500 via-green-500 to-teal-600",
    D: "from-violet-500 via-purple-500 to-fuchsia-600",
  };

  const positionStyles = {
    1: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-300/50",
    2: "bg-gradient-to-r from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-300/50",
    3: "bg-gradient-to-r from-orange-400 to-amber-600 text-white shadow-lg shadow-orange-300/50",
    4: "bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-lg shadow-slate-300/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl transition-all duration-300"
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${tableGradients[table.table]} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl border-2 border-white/40 shadow-2xl"
          >
            <span className="text-3xl font-black text-white">{table.table}</span>
          </motion.div>
          <div>
            <h3 className="text-2xl font-black text-white drop-shadow-lg">Tavolo {table.table}</h3>
            <p className="text-white/90 font-medium">{table.players.length} giocatori</p>
          </div>
        </div>
      </div>

      {/* Game Selection */}
      <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 border-b border-slate-200">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Gioco del tavolo</label>
          <div className="flex gap-3">
            <select
              className={`flex-1 px-4 py-3 rounded-xl border-2 font-semibold transition-all duration-200 ${
                hasRepeatWarning
                  ? "border-rose-400 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-300/50"
                  : "border-slate-200 bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50"
              }`}
              value={table.game || ""}
              onChange={(e) => onGameChange(e.target.value)}
            >
              <option value="">— Seleziona un gioco —</option>
              {games.map((g) => (
                <option key={g.title} value={g.title}>
                  {g.title}
                </option>
              ))}
            </select>
            <ModernButton variant="primary" onClick={onSuggestGame} icon={<HiSparkles />}>
              Suggerisci
            </ModernButton>
          </div>
          <AnimatePresence>
            {hasRepeatWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 p-4 bg-rose-100 border-l-4 border-rose-500 rounded-xl"
              >
                <HiExclamation className="text-2xl text-rose-600 flex-shrink-0" />
                <p className="text-sm text-rose-800 font-semibold">
                  Attenzione: qualcuno ha già giocato questo titolo. Cambia gioco per rispettare la regola "no repeat".
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Players */}
      <div className="p-6 space-y-3">
        <AnimatePresence>
          {table.players.map((pid, idx) => {
            const position = table.positions[pid];
            const posStyle = position ? positionStyles[position as keyof typeof positionStyles] : "";

            return (
              <motion.div
                key={pid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                  position
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-lg"
                    : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-sm border border-slate-300">
                  <span className="text-sm font-black text-slate-700">{idx + 1}</span>
                </div>
                <div className="flex-1 font-bold text-slate-800 text-lg truncate">
                  {playerMap[pid]?.name}
                </div>
                <select
                  className={`px-4 py-2.5 rounded-xl border-2 font-black transition-all duration-200 ${
                    position
                      ? `${posStyle} border-transparent`
                      : "bg-white border-slate-300 text-slate-600 hover:border-indigo-400"
                  }`}
                  value={table.positions[pid] ?? ""}
                  onChange={(e) => onPositionChange(pid, e.target.value ? parseInt(e.target.value, 10) : null)}
                >
                  <option value="">—</option>
                  <option value={1}>🥇 1°</option>
                  <option value={2}>🥈 2°</option>
                  <option value={3}>🥉 3°</option>
                  <option value={4}>4°</option>
                </select>
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-100 rounded-xl shadow-sm border border-indigo-200">
                  <span className="text-sm text-indigo-600">🎮</span>
                  <span className="text-sm font-black text-indigo-700">{playerMap[pid]?.gamesPlayed.length}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
