import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiSparkles } from "react-icons/hi";
import { FaTrophy } from "react-icons/fa";
import { GlassCard, ModernButton } from "../ui";
import { TableCard } from "../cards";
import type { RoundData, Player, Game, TableLetter } from "../../types";
import { MULTIPLIER } from "../../constants";

interface CurrentRoundProps {
  round: RoundData | null;
  playerMap: Record<string, Player>;
  games: Game[];
  roundIndex: number;
  hasRepeatGameForAny: (table: any) => boolean;
  onGameChange: (roundIndex: number, table: TableLetter, game: string) => void;
  onPositionChange: (roundIndex: number, table: TableLetter, pid: string, pos: number | null) => void;
  onSuggestGame: (roundIndex: number, table: TableLetter, playerIds: string[]) => void;
  onFinalize: (roundIndex: number) => void;
}

export const CurrentRound: React.FC<CurrentRoundProps> = ({
  round,
  playerMap,
  games,
  roundIndex,
  hasRepeatGameForAny,
  onGameChange,
  onPositionChange,
  onSuggestGame,
  onFinalize,
}) => {
  if (!round) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mb-12"
      >
        <GlassCard className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
                <HiCheckCircle className="text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800">Round {round.index}</h2>
                <p className="text-slate-600 font-medium">In corso</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border-2 border-amber-300 shadow-lg">
              <span className="text-amber-700 font-bold text-lg">Moltiplicatore:</span>
              <span className="text-2xl font-black text-amber-900">×{MULTIPLIER[round.index]}</span>
            </div>
          </div>
        </GlassCard>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {round.tables.map((t) => (
            <TableCard
              key={t.table}
              table={t}
              playerMap={playerMap}
              games={games}
              hasRepeatWarning={hasRepeatGameForAny(t)}
              onGameChange={(game) => onGameChange(roundIndex, t.table, game)}
              onPositionChange={(pid, pos) => onPositionChange(roundIndex, t.table, pid, pos)}
              onSuggestGame={() => onSuggestGame(roundIndex, t.table, t.players)}
            />
          ))}
        </div>

        <GlassCard className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <ModernButton
              variant="success"
              onClick={() => onFinalize(roundIndex)}
              icon={round.index < 4 ? <HiCheckCircle /> : <FaTrophy />}
              className="text-lg px-10 py-4"
            >
              {round.index < 4 ? '✅ Chiudi round e genera successivo' : '🏆 Chiudi round finale'}
            </ModernButton>
            <div className="flex items-start gap-3 p-5 bg-blue-100 rounded-2xl border-2 border-blue-300">
              <HiSparkles className="text-2xl text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800 font-semibold">
                <strong>Tip:</strong> Puoi assegnare la stessa posizione a più giocatori per gestire i pareggi.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.section>
    </AnimatePresence>
  );
};
