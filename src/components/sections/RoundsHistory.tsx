import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";
import type { RoundData, Player } from "../../types";

interface RoundsHistoryProps {
  rounds: RoundData[];
  playerMap: Record<string, Player>;
}

export const RoundsHistory: React.FC<RoundsHistoryProps> = ({ rounds, playerMap }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (rounds.length === 0) {
    return null;
  }

  const getPlayerName = (playerId: string) => playerMap[playerId]?.name || "Sconosciuto";

  const getPositionBadge = (position: number | null) => {
    if (position === null) return "—";
    const badges = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    return badges[position - 1] || `${position}°`;
  };

  const getPositionColor = (position: number | null) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300";
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <section className="mb-12">
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header with Toggle */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:from-indigo-600 hover:to-purple-700"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div className="text-left">
                <h2 className="text-xl font-black">Storico Round</h2>
                <p className="text-sm font-semibold text-indigo-100">Riepilogo dei risultati di ogni round</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <HiChevronDown className="text-2xl" />
            </motion.div>
          </button>
        </motion.div>

        {/* Rounds grid - Collapsible */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
          {rounds.map((round, roundIdx) => (
            <motion.div
              key={round.index}
              className="border-2 border-indigo-200 rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: roundIdx * 0.1 }}
            >
              {/* Round header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-indigo-200">
                <div className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 text-white w-16 h-16 flex items-center justify-center rounded-full">
                  {round.index}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-indigo-700">Round {round.index}</h3>
                  <p className="text-sm text-slate-600">
                    {round.tables.length} tavoli • {round.tables.reduce((sum, t) => sum + t.players.length, 0)} giocatori
                  </p>
                </div>
              </div>

              {/* Tables grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {round.tables.map((table) => (
                  <motion.div
                    key={`${round.index}-${table.table}`}
                    className="bg-white rounded-xl p-4 border-2 border-indigo-100 hover:border-indigo-300 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Table header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-3xl font-black text-indigo-600 mb-1">Tavolo {table.table}</div>
                        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                          {table.game || "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                          {table.players.length} giocatori
                        </span>
                      </div>
                    </div>

                    {/* Players list */}
                    <div className="space-y-2">
                      {table.players.map((playerId, idx) => {
                        const position = table.positions[playerId];
                        const playerName = getPlayerName(playerId);

                        return (
                          <motion.div
                            key={playerId}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${getPositionColor(position)}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-lg font-black min-w-8 text-center">
                                {getPositionBadge(position)}
                              </span>
                              <span className="font-semibold text-slate-800">{playerName}</span>
                            </div>
                            {position && (
                              <span className="text-xs font-bold text-slate-600 bg-white bg-opacity-50 px-2 py-1 rounded">
                                Pos. {position}
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
