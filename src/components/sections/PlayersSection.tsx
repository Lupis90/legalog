import { AnimatePresence } from "framer-motion";
import { HiUserGroup } from "react-icons/hi";
import { GlassCard, ModernButton } from "../ui";
import { PlayerCard } from "../cards";
import type { Player } from "../../types";

interface PlayersSectionProps {
  players: Player[];
  onAdd: () => void;
  onRemove: () => void;
  onNameChange: (id: string, name: string) => void;
}

export const PlayersSection: React.FC<PlayersSectionProps> = ({
  players,
  onAdd,
  onRemove,
  onNameChange,
}) => (
  <GlassCard className="p-8">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
        <HiUserGroup className="text-3xl text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-800">Giocatori</h2>
        <p className="text-slate-600 font-medium">{players.length} partecipanti</p>
      </div>
    </div>
    <div className="flex gap-3 mb-6">
      <ModernButton variant="primary" onClick={onAdd} className="flex-1">
        + Aggiungi
      </ModernButton>
      <ModernButton variant="secondary" onClick={onRemove} className="flex-1">
        − Rimuovi
      </ModernButton>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
      <AnimatePresence>
        {players.map((p, idx) => (
          <PlayerCard
            key={p.id}
            player={p}
            index={idx}
            onNameChange={(name) => onNameChange(p.id, name)}
          />
        ))}
      </AnimatePresence>
    </div>
  </GlassCard>
);
