import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { HiPencil } from "react-icons/hi";
import { GlassCard } from "../ui";
import type { StandingRow } from "../../types";

interface StandingsTableProps {
  standings: StandingRow[];
  onEditName: (playerId: string) => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings, onEditName }) => (
  <section className="mb-12">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-xl">
        <FaTrophy className="text-3xl text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-white">Classifica</h2>
        <p className="text-slate-300 font-medium">Punteggi e posizioni attuali</p>
      </div>
    </div>

    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 border-b-4 border-indigo-500">
              <th className="text-left px-6 py-5 font-black text-white text-sm uppercase tracking-wider">Pos.</th>
              <th className="text-left px-6 py-5 font-black text-white text-sm uppercase tracking-wider">Giocatore</th>
              <th className="text-right px-6 py-5 font-black text-white text-sm uppercase tracking-wider">Totale</th>
              <th className="text-right px-6 py-5 font-black text-white text-sm uppercase tracking-wider">SOS</th>
              <th className="text-right px-6 py-5 font-black text-white text-sm uppercase tracking-wider">Vittorie</th>
              {[1, 2, 3, 4].map((r) => (
                <th key={r} className="text-center px-6 py-5 font-black text-white text-sm uppercase tracking-wider">
                  R{r}
                </th>
              ))}
              <th className="text-left px-6 py-5 font-black text-white text-sm uppercase tracking-wider">Giochi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <AnimatePresence>
              {standings.map((row, i) => {
                const isPodium = i < 3;
                const isTopTable = i < 4;
                const podiumBg = {
                  0: "bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-100 border-l-8 border-yellow-400",
                  1: "bg-gradient-to-r from-slate-100 via-gray-100 to-slate-100 border-l-8 border-slate-400",
                  2: "bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 border-l-8 border-orange-400",
                };
                const podiumIcon = { 0: "🥇", 1: "🥈", 2: "🥉" };

                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`hover:bg-slate-50/50 transition-all duration-200 ${
                      isPodium ? podiumBg[i as keyof typeof podiumBg] : isTopTable ? "bg-emerald-50/50" : "bg-white/50"
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-xl shadow-lg ${
                          isPodium
                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white"
                            : isTopTable
                            ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isPodium ? podiumIcon[i as keyof typeof podiumIcon] : i + 1}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="font-black text-slate-800 text-lg">{row.name}</div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onEditName(row.id)}
                          className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
                          title="Modifica nome"
                        >
                          <HiPencil className="text-lg" />
                        </motion.button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl font-black text-lg shadow-lg ${
                          isPodium
                            ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                            : isTopTable
                            ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {row.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-slate-700 font-bold text-lg">{row.sos.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-xl border-2 border-blue-300">
                        <span className="text-blue-700 font-black text-lg">{row.wins}</span>
                        <FaTrophy className="text-blue-500 text-xl" />
                      </div>
                    </td>
                    {[0, 1, 2, 3].map((idx) => (
                      <td key={idx} className="px-6 py-5 text-center">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-xl text-sm font-bold ${
                            row.rounds[idx] != null
                              ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                              : "text-slate-300"
                          }`}
                        >
                          {row.rounds[idx] != null ? row.rounds[idx].toFixed(2) : "—"}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2 max-w-xs">
                        {row.games.map((game, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold border-2 border-purple-300"
                          >
                            {game}
                          </span>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="border-t-4 border-indigo-500 bg-gradient-to-r from-slate-100 to-indigo-100 p-6">
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-700 font-semibold">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg shadow-md"></div>
            <span>Podio (1°-3°)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-md"></div>
            <span>Tavolo A (Top 4)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-black">SOS</span>
            <span>= Strength of Schedule</span>
          </div>
        </div>
      </div>
    </GlassCard>
  </section>
);
