import { AnimatePresence } from "framer-motion";
import { HiPuzzle } from "react-icons/hi";
import { GlassCard, ModernButton } from "../ui";
import { GameCard } from "../cards";
import type { Game } from "../../types";

interface GamesSectionProps {
  games: Game[];
  onUpdate: (index: number, field: keyof Game, value: string | number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

export const GamesSection: React.FC<GamesSectionProps> = ({
  games,
  onUpdate,
  onRemove,
  onAdd,
}) => (
  <GlassCard className="p-8">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
        <HiPuzzle className="text-3xl text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-800">Giochi</h2>
        <p className="text-slate-600 font-medium">{games.length} titoli disponibili</p>
      </div>
    </div>
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      <AnimatePresence>
        {games.map((g, i) => (
          <GameCard
            key={g.title}
            game={g}
            onUpdate={(field, value) => onUpdate(i, field, value)}
            onRemove={() => onRemove(i)}
          />
        ))}
      </AnimatePresence>
      <ModernButton variant="primary" onClick={onAdd} className="w-full">
        + Aggiungi gioco
      </ModernButton>
    </div>
  </GlassCard>
);
