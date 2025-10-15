import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  HiSparkles, HiUserGroup, HiPuzzle,
  HiPlay, HiDownload, HiUpload, HiClipboard,
  HiCheckCircle, HiExclamation, HiChevronDown
} from "react-icons/hi";
import { FaTrophy } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";

/**
 * LOG League – Dashboard (Big-Game Flavor)
 * Modernized with Framer Motion, React Icons, React Hot Toast, Headless UI
 */

// --- Types ---
const TABLES = ["A", "B", "C", "D"] as const;
type TableLetter = typeof TABLES[number];

type Player = {
  id: string;
  name: string;
  total: number;
  roundPoints: number[];
  wins: number;
  gamesPlayed: string[];
  hotStreakTriggered: boolean;
};

type TableResult = {
  table: TableLetter;
  game: string | null;
  players: string[];
  positions: Record<string, number | null>;
};

type RoundData = {
  index: 1 | 2 | 3 | 4;
  tables: TableResult[];
};

type Game = { title: string; weight: number; duration: string };

const DEFAULT_GAMES: Game[] = [
  { title: "7 Wonders", weight: 2.29, duration: "30 min" },
  { title: "Splendor", weight: 1.78, duration: "30 min" },
  { title: "Azul", weight: 1.77, duration: "45 min" },
  { title: "Harmonies", weight: 2.01, duration: "45 min" },
  { title: "Faraway", weight: 1.91, duration: "30 min" },
  { title: "Cities", weight: 1.92, duration: "45 min" },
  { title: "Heat: Pedal to the Metal", weight: 2.20, duration: "45 min" },
  { title: "Ticket to Ride Europe", weight: 1.92, duration: "45 min" },
];

const MULTIPLIER: Record<number, number> = { 1: 1, 2: 1, 3: 1.25, 4: 1.5 };
const BASE_POINTS_4 = { 1: 7, 2: 5, 3: 3, 4: 1 } as const;
const BASE_POINTS_3 = { 1: 7, 2: 4, 3: 2 } as const;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

function basePointsForPositions(size: number, posNumbers: number[]): number {
  if (size === 5) {
    const SCALE_5 = { 1: 8, 2: 6, 3: 4, 4: 2, 5: 1 } as const;
    const sum = posNumbers.reduce((acc, p) => acc + (SCALE_5 as any)[p], 0);
    return sum / posNumbers.length;
  }
  const table = size === 3 ? (BASE_POINTS_3 as any) : (BASE_POINTS_4 as any);
  const sum = posNumbers.reduce((acc, p) => acc + (table[p] ?? 0), 0);
  return sum / posNumbers.length;
}

function keyPair(a: string, b: string) {
  return [a, b].sort().join("|");
}

// --- Modern Components ---

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const ModernButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  icon?: React.ReactNode;
  className?: string;
}> = ({ children, onClick, variant = "primary", icon, className = "" }) => {
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-indigo-500/50",
    secondary: "bg-white/90 hover:bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300",
    danger: "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/50",
    success: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/50"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </motion.button>
  );
};

const PlayerCard: React.FC<{
  player: Player;
  index: number;
  onNameChange: (name: string) => void;
}> = ({ player, index, onNameChange }) => (
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

const GameCard: React.FC<{
  game: Game;
  onUpdate: (field: keyof Game, value: string | number) => void;
  onRemove: () => void;
}> = ({ game, onUpdate, onRemove }) => (
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

const TableCard: React.FC<{
  table: TableResult;
  playerMap: Record<string, Player>;
  games: Game[];
  hasRepeatWarning: boolean;
  onGameChange: (game: string) => void;
  onPositionChange: (playerId: string, position: number | null) => void;
  onSuggestGame: () => void;
}> = ({ table, playerMap, games, hasRepeatWarning, onGameChange, onPositionChange, onSuggestGame }) => {
  const tableGradients = {
    A: "from-rose-500 via-red-500 to-pink-600",
    B: "from-blue-500 via-indigo-500 to-purple-600",
    C: "from-emerald-500 via-green-500 to-teal-600",
    D: "from-violet-500 via-purple-500 to-fuchsia-600"
  };

  const positionStyles = {
    1: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-300/50",
    2: "bg-gradient-to-r from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-300/50",
    3: "bg-gradient-to-r from-orange-400 to-amber-600 text-white shadow-lg shadow-orange-300/50",
    4: "bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-lg shadow-slate-300/50"
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

// --- Main App ---
export default function App() {
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: 16 }, (_, i) => ({
      id: uid(),
      name: `Giocatore ${i + 1}`,
      total: 0,
      roundPoints: [],
      wins: 0,
      gamesPlayed: [],
      hotStreakTriggered: false,
    }))
  );
  const [games, setGames] = useState<Game[]>(deepClone(DEFAULT_GAMES));
  const [activeRound, setActiveRound] = useState<1 | 2 | 3 | 4 | 0>(0);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [meetingsMap, setMeetingsMap] = useState<Record<string, number>>({});
  const [jsonIO, setJsonIO] = useState<string>("");
  const [showExportModal, setShowExportModal] = useState(false);

  const playerMap = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  );

  const gamesByTitle = useMemo(
    () => new Map(games.map((g) => [g.title, g])),
    [games]
  );

  function addPlayer() {
    setPlayers((ps) => [
      ...ps,
      { id: uid(), name: `Giocatore ${ps.length + 1}`, total: 0, roundPoints: [], wins: 0, gamesPlayed: [], hotStreakTriggered: false },
    ]);
    toast.success("Giocatore aggiunto!");
  }

  function removeLastPlayer() {
    if (players.length > 0) {
      setPlayers((ps) => ps.slice(0, -1));
      toast.success("Giocatore rimosso!");
    }
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function makeEmptyRound(index: 1 | 2 | 3 | 4, tableAssignments: Record<TableLetter, string[]>): RoundData {
    return {
      index,
      tables: TABLES.map((t) => ({
        table: t,
        game: null,
        players: tableAssignments[t],
        positions: Object.fromEntries(tableAssignments[t].map((id) => [id, null])),
      })),
    };
  }

  function suggestGameForTable(playerIds: string[]): string | null {
    const disallowedByAny = new Set<string>();
    playerIds.forEach((pid) => {
      const pl = playerMap[pid];
      pl?.gamesPlayed.forEach((g) => disallowedByAny.add(g));
    });
    const options = games
      .filter((g) => !disallowedByAny.has(g.title))
      .sort((a, b) => a.weight - b.weight);
    return options[0]?.title ?? games[0]?.title ?? null;
  }

  function hasRepeatGameForAny(table: TableResult): boolean {
    if (!table.game) return false;
    return table.players.some((pid) => playerMap[pid]?.gamesPlayed.includes(table.game!));
  }

  function startTournament() {
    const N = players.length;
    if (N < 8) {
      toast.error("Servono almeno 8 giocatori per 4 tavoli!");
      return;
    }
    const shuffled = shuffle(players.map((p) => p.id));
    const perTable = Math.ceil(shuffled.length / TABLES.length);
    const tableAssignments: Record<TableLetter, string[]> = { A: [], B: [], C: [], D: [] };
    TABLES.forEach((t, i) => {
      tableAssignments[t] = shuffled.slice(i * perTable, (i + 1) * perTable);
    });

    const r1 = makeEmptyRound(1, tableAssignments);
    r1.tables.forEach((tbl) => {
      tbl.game = suggestGameForTable(tbl.players);
    });
    setRounds([r1]);
    setActiveRound(1);
    toast.success("🎉 Round 1 iniziato!");
  }

  function updatePosition(rIndex: number, table: TableLetter, pid: string, pos: number | null) {
    setRounds((rs) => {
      const next = deepClone(rs);
      const r = next[rIndex];
      const t = r.tables.find((x) => x.table === table)!;
      t.positions[pid] = pos;
      return next;
    });
  }

  function setGameForTable(rIndex: number, table: TableLetter, gameTitle: string) {
    setRounds((rs) => {
      const next = deepClone(rs);
      const r = next[rIndex];
      const t = r.tables.find((x) => x.table === table)!;
      t.game = gameTitle;
      return next;
    });
  }

  function finalizeRound(roundIdx0: number) {
    const rs = deepClone(rounds);
    const round = rs[roundIdx0];

    for (const table of round.tables) {
      if (!table.game) {
        toast.error(`Scegli un gioco per il tavolo ${table.table}`);
        return;
      }
      const size = table.players.length;
      const anyNull = table.players.some((pid) => table.positions[pid] == null);
      if (anyNull) {
        toast.error(`Completa i piazzamenti al tavolo ${table.table}`);
        return;
      }
      if (size === 5) {
        toast.error(`Attenzione: il tavolo ${table.table} ha 5 giocatori!`);
      }
    }

    const multiplier = MULTIPLIER[round.index];
    const perPlayerRoundBase: Record<string, number> = {};
    const perPlayerRoundWin: Record<string, boolean> = {};

    round.tables.forEach((table) => {
      const size = table.players.length;
      const groups: Record<number, string[]> = {};
      table.players.forEach((pid) => {
        const pos = table.positions[pid]! as number;
        groups[pos] = groups[pos] || [];
        groups[pos].push(pid);
      });
      Object.entries(groups).forEach(([posStr, ids]) => {
        const p = parseInt(posStr, 10);
        const positionsRange = ids.map(() => p);
        const base = basePointsForPositions(size, positionsRange);
        ids.forEach((pid) => { perPlayerRoundBase[pid] = base; });
      });
      (groups[1] || []).forEach((pid) => { perPlayerRoundWin[pid] = true; });
    });

    const perPlayerBonusRaw: Record<string, number> = {};
    const prevMeetings = deepClone(meetingsMap);

    round.tables.forEach((table) => {
      const posOf: Record<string, number> = {};
      table.players.forEach((pid) => { posOf[pid] = table.positions[pid]!; });

      for (let i = 0; i < table.players.length; i++) {
        for (let j = i + 1; j < table.players.length; j++) {
          const a = table.players[i];
          const b = table.players[j];
          const k = keyPair(a, b);
          const met = prevMeetings[k] || 0;
          if (met >= 2) {
            const pa = posOf[a];
            const pb = posOf[b];
            if (pa !== pb) {
              const winner = pa < pb ? a : b;
              perPlayerBonusRaw[winner] = (perPlayerBonusRaw[winner] || 0) + 1;
            }
          }
        }
      }

      table.players.forEach((pid) => {
        const pl = playerMap[pid];
        const won = posOf[pid] === 1;
        const prevRounds = pl.roundPoints.length;
        const wonPrev = prevRounds > 0 && (pl as any)._lastWasWin === true;
        if (won && wonPrev && !pl.hotStreakTriggered) {
          perPlayerBonusRaw[pid] = (perPlayerBonusRaw[pid] || 0) + 1;
        }
      });
    });

    const perPlayerRoundTotal: Record<string, number> = {};
    players.forEach((pl) => {
      const base = perPlayerRoundBase[pl.id] ?? 0;
      const rawBonus = perPlayerBonusRaw[pl.id] ?? 0;
      const bonus = Math.min(3, rawBonus);
      const total = base * multiplier + bonus;
      perPlayerRoundTotal[pl.id] = Number(total.toFixed(2));
    });

    const nextPlayers = players.map((pl) => ({ ...pl }));
    const idxById = Object.fromEntries(nextPlayers.map((p, i) => [p.id, i]));

    const nextMeetings = deepClone(meetingsMap);
    round.tables.forEach((table) => {
      for (let i = 0; i < table.players.length; i++) {
        for (let j = i + 1; j < table.players.length; j++) {
          const a = table.players[i], b = table.players[j];
          const k = keyPair(a, b);
          nextMeetings[k] = (nextMeetings[k] || 0) + 1;
        }
      }
    });

    round.tables.forEach((table) => {
      table.players.forEach((pid) => {
        const i = idxById[pid];
        const add = perPlayerRoundTotal[pid] || 0;
        nextPlayers[i].total = Number((nextPlayers[i].total + add).toFixed(2));
        nextPlayers[i].roundPoints = [...nextPlayers[i].roundPoints, add];
        const isWin = (table.positions[pid]! === 1);
        if (isWin) nextPlayers[i].wins += 1;
        const prevWasWin = (playerMap[pid] as any)._lastWasWin === true;
        if (isWin && prevWasWin && !nextPlayers[i].hotStreakTriggered) {
          nextPlayers[i].hotStreakTriggered = true;
        }
        (nextPlayers[i] as any)._lastWasWin = isWin;
        if (table.game && !nextPlayers[i].gamesPlayed.includes(table.game)) {
          nextPlayers[i].gamesPlayed.push(table.game);
        }
      });
    });

    setPlayers(nextPlayers);
    setMeetingsMap(nextMeetings);

    if (round.index < 4) {
      const nextAssignments = computePromotions(round, nextPlayers);
      const nextR = makeEmptyRound((round.index + 1) as 2 | 3 | 4, nextAssignments);
      nextR.tables.forEach((tbl) => { tbl.game = suggestGameForTable(tbl.players); });
      rs[roundIdx0] = round;
      setRounds([...rs, nextR]);
      setActiveRound((round.index + 1) as 2 | 3 | 4);
      toast.success(`✅ Round ${round.index} completato! Round ${round.index + 1} generato.`);
    } else {
      rs[roundIdx0] = round;
      setRounds(rs);
      setActiveRound(0);
      toast.success("🏆 Torneo concluso! Congratulazioni!");
    }
  }

  function computePromotions(round: RoundData, ps: Player[]): Record<TableLetter, string[]> {
    const byId = Object.fromEntries(ps.map((p) => [p.id, p]));
    const current: Record<TableLetter, string[]> = { A: [], B: [], C: [], D: [] };
    round.tables.forEach((t) => { current[t.table] = t.players.slice(); });

    const next: Record<TableLetter, string[]> = { A: [], B: [], C: [], D: [] };

    function decideWinnersLosers(t: TableResult) {
      const entries = t.players.map((pid) => ({ pid, pos: t.positions[pid]! }));
      entries.sort((a, b) => a.pos - b.pos);
      const sorted = entries.slice();
      const top = pickWithBoundary(sorted, 2, byId, true);
      const bottom = pickWithBoundary(sorted.slice().reverse(), 2, byId, false);
      return { winners: top, losers: bottom };
    }

    function pickWithBoundary(arr: { pid: string; pos: number }[], k: number, byId: any, isTop: boolean): string[] {
      if (arr.length <= k) return arr.map((x) => x.pid);
      const edgePos = arr[k - 1].pos;
      const block = arr.filter((x) => x.pos === edgePos);
      if (block.length === 1) return arr.slice(0, k).map((x) => x.pid);
      const start = arr.findIndex((x) => x.pos === edgePos);
      const end = start + block.length;
      const fixed = arr.slice(0, start);
      const contenders = arr.slice(start, end);
      contenders.sort((a, b) => (byId[b.pid].total - byId[a.pid].total));
      const need = Math.max(0, k - fixed.length);
      const picked = contenders.slice(0, need).map((x) => x.pid);
      while (picked.length < need) {
        const rest = contenders.filter((x) => !picked.includes(x.pid));
        if (rest.length === 0) break;
        const r = rest[Math.floor(Math.random() * rest.length)];
        picked.push(r.pid);
      }
      return [...fixed.map((x) => x.pid), ...picked];
    }

    round.tables.forEach((t) => {
      const { winners, losers } = decideWinnersLosers(t);
      const idx = TABLES.indexOf(t.table);
      const up = Math.max(0, idx - 1);
      const down = Math.min(TABLES.length - 1, idx + 1);
      const stayers = t.players.filter((pid) => !winners.includes(pid) && !losers.includes(pid));
      next[TABLES[up]].push(...winners);
      next[TABLES[down]].push(...losers);
      next[t.table].push(...stayers);
    });

    function rebalance(targetSize = 4) {
      const deficit = () => TABLES.filter((t) => next[t].length < targetSize);
      const surplus = () => TABLES.filter((t) => next[t].length > targetSize);
      let guard = 50;
      while (deficit().length && surplus().length && guard-- > 0) {
        const d = deficit()[0];
        const di = TABLES.indexOf(d);
        const candidates = [di - 1, di + 1].filter((x) => x >= 0 && x < TABLES.length).map((i) => TABLES[i]);
        let moved = false;
        for (const c of candidates) {
          if (next[c].length > targetSize) {
            const pid = next[c].pop()!;
            next[d].push(pid);
            moved = true;
            break;
          }
        }
        if (!moved) {
          const s = surplus()[0];
          const pid = next[s].pop()!;
          next[d].push(pid);
        }
      }
    }
    rebalance(4);

    return next;
  }

  const standings = useMemo(() => {
    const sos: Record<string, number> = {};
    const h2h: Record<string, Record<string, number>> = {};

    rounds.forEach((r) => {
      r.tables.forEach((t) => {
        t.players.forEach((a) => {
          sos[a] = sos[a] || 0;
          t.players.forEach((b) => {
            if (a === b) return;
            sos[a] += playerMap[b]?.total || 0;
            const pa = t.positions[a]!;
            const pb = t.positions[b]!;
            if (!h2h[a]) h2h[a] = {};
            if (!h2h[b]) h2h[b] = {};
            if (pa < pb) {
              h2h[a][b] = (h2h[a][b] || 0) + 1;
              h2h[b][a] = (h2h[b][a] || 0) - 1;
            } else if (pa > pb) {
              h2h[a][b] = (h2h[a][b] || 0) - 1;
              h2h[b][a] = (h2h[b][a] || 0) + 1;
            }
          });
        });
      });
    });

    const rows = players.map((p) => ({
      id: p.id,
      name: p.name,
      total: p.total,
      wins: p.wins,
      sos: Number((sos[p.id] || 0).toFixed(2)),
      h2h: h2h[p.id] || {},
      rounds: p.roundPoints,
      games: p.gamesPlayed,
    }));

    rows.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      if (b.sos !== a.sos) return b.sos - a.sos;
      if (b.wins !== a.wins) return b.wins - a.wins;
      const d = (a.h2h[b.id] || 0) - (b.h2h[a.id] || 0);
      if (d !== 0) return -d;
      return a.name.localeCompare(b.name);
    });

    return rows;
  }, [players, rounds, playerMap]);

  const currentRound = activeRound ? rounds.find((r) => r.index === activeRound) || null : null;

  function exportJSON() {
    const data = { players, games, rounds, meetingsMap };
    setJsonIO(JSON.stringify(data, null, 2));
    setShowExportModal(true);
    toast.success("JSON generato!");
  }

  function importJSON() {
    try {
      const data = JSON.parse(jsonIO);
      if (!data.players || !data.rounds) throw new Error("JSON non valido");
      setPlayers(data.players);
      setGames(data.games || DEFAULT_GAMES);
      setRounds(data.rounds);
      setMeetingsMap(data.meetingsMap || {});
      setActiveRound(data.rounds[data.rounds.length - 1]?.index || 0);
      toast.success("✅ Dati importati con successo!");
    } catch (e: any) {
      toast.error("❌ Errore import JSON: " + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1e293b',
            fontWeight: 600,
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          },
        }}
      />

      <div className="relative max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Hero Header */}
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
                <ModernButton variant="success" onClick={startTournament} icon={<HiPlay />}>
                  Avvia R1
                </ModernButton>
                <ModernButton variant="secondary" onClick={exportJSON} icon={<HiDownload />}>
                  Esporta
                </ModernButton>
              </div>
            </div>
          </GlassCard>
        </motion.header>

        {/* Setup Section */}
        <section className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Players */}
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
              <ModernButton variant="primary" onClick={addPlayer} className="flex-1">
                + Aggiungi
              </ModernButton>
              <ModernButton variant="secondary" onClick={removeLastPlayer} className="flex-1">
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
                    onNameChange={(name) => setPlayers((ps) => ps.map((x) => x.id === p.id ? { ...x, name } : x))}
                  />
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>

          {/* Games */}
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
                    onUpdate={(field, value) => setGames((gs) => gs.map((x, idx) => idx === i ? { ...x, [field]: value } : x))}
                    onRemove={() => setGames((gs) => gs.filter((_, idx) => idx !== i))}
                  />
                ))}
              </AnimatePresence>
              <ModernButton
                variant="primary"
                onClick={() => setGames((gs) => [...gs, { title: `Nuovo gioco ${gs.length + 1}`, weight: 2.0, duration: "45 min" }])}
                className="w-full"
              >
                + Aggiungi gioco
              </ModernButton>
            </div>
          </GlassCard>
        </section>

        {/* Current Round */}
        <AnimatePresence>
          {currentRound && (
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
                      <h2 className="text-3xl font-black text-slate-800">Round {currentRound.index}</h2>
                      <p className="text-slate-600 font-medium">In corso</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border-2 border-amber-300 shadow-lg">
                    <span className="text-amber-700 font-bold text-lg">Moltiplicatore:</span>
                    <span className="text-2xl font-black text-amber-900">×{MULTIPLIER[currentRound.index]}</span>
                  </div>
                </div>
              </GlassCard>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {currentRound.tables.map((t) => (
                  <TableCard
                    key={t.table}
                    table={t}
                    playerMap={playerMap}
                    games={games}
                    hasRepeatWarning={hasRepeatGameForAny(t)}
                    onGameChange={(game) => setGameForTable(rounds.indexOf(currentRound), t.table, game)}
                    onPositionChange={(pid, pos) => updatePosition(rounds.indexOf(currentRound), t.table, pid, pos)}
                    onSuggestGame={() => setGameForTable(rounds.indexOf(currentRound), t.table, suggestGameForTable(t.players) || '')}
                  />
                ))}
              </div>

              <GlassCard className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <ModernButton
                    variant="success"
                    onClick={() => finalizeRound(rounds.indexOf(currentRound))}
                    icon={currentRound.index < 4 ? <HiCheckCircle /> : <FaTrophy />}
                    className="text-lg px-10 py-4"
                  >
                    {currentRound.index < 4 ? '✅ Chiudi round e genera successivo' : '🏆 Chiudi round finale'}
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
          )}
        </AnimatePresence>

        {/* Standings */}
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
                    <th className="text-center px-6 py-5 font-black text-white text-sm uppercase tracking-wider">R1</th>
                    <th className="text-center px-6 py-5 font-black text-white text-sm uppercase tracking-wider">R2</th>
                    <th className="text-center px-6 py-5 font-black text-white text-sm uppercase tracking-wider">R3</th>
                    <th className="text-center px-6 py-5 font-black text-white text-sm uppercase tracking-wider">R4</th>
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
                        2: "bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 border-l-8 border-orange-400"
                      };
                      const podiumIcon = { 0: "🥇", 1: "🥈", 2: "🥉" };

                      return (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`hover:bg-slate-50/50 transition-all duration-200 ${
                            isPodium
                              ? podiumBg[i as keyof typeof podiumBg]
                              : isTopTable
                              ? "bg-emerald-50/50"
                              : "bg-white/50"
                          }`}
                        >
                          <td className="px-6 py-5">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-xl shadow-lg ${
                              isPodium
                                ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white"
                                : isTopTable
                                ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}>
                              {isPodium ? podiumIcon[i as keyof typeof podiumIcon] : i + 1}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-black text-slate-800 text-lg">{row.name}</div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className={`inline-flex items-center px-4 py-2 rounded-xl font-black text-lg shadow-lg ${
                              isPodium
                                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                                : isTopTable
                                ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}>
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
                          {Array.from({ length: 4 }, (_, idx) => (
                            <td key={idx} className="px-6 py-5 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-xl text-sm font-bold ${
                                row.rounds[idx] != null
                                  ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                                  : "text-slate-300"
                              }`}>
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

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <GlassCard className="p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HiSparkles className="text-2xl text-indigo-600" />
              <h3 className="text-xl font-black text-slate-800">Regolamento</h3>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-2 font-medium">
              <p><strong>Punteggi base:</strong> 7-5-3-1 (4p), 7-4-2 (3p)</p>
              <p><strong>Moltiplicatori:</strong> R1=×1, R2=×1, R3=×1.25, R4=×1.5</p>
              <p><strong>Bonus:</strong> Hot Streak (+1 alla 2ª vittoria consecutiva), Arcinemico (+1 al 3° incontro), Cap totale +3</p>
              <p><strong>Tie-breakers:</strong> Punti totali → SOS → Vittorie → Head-to-head</p>
            </div>
            <p className="mt-6 text-xs text-slate-400 font-semibold">
              LOG League Dashboard · Big-Game Flavor · Powered by React + Framer Motion
            </p>
          </GlassCard>
        </motion.footer>
      </div>

      {/* Export Modal */}
      <Transition appear show={showExportModal} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowExportModal(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all">
                  <Dialog.Title className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <HiDownload className="text-indigo-600" />
                    Esporta / Importa Dati
                  </Dialog.Title>

                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <ModernButton variant="primary" onClick={exportJSON} icon={<HiDownload />}>
                        Aggiorna JSON
                      </ModernButton>
                      <ModernButton variant="success" onClick={importJSON} icon={<HiUpload />}>
                        Importa JSON
                      </ModernButton>
                      <ModernButton
                        variant="secondary"
                        onClick={() => {
                          if (jsonIO) {
                            navigator.clipboard.writeText(jsonIO);
                            toast.success("📋 JSON copiato!");
                          }
                        }}
                        icon={<HiClipboard />}
                      >
                        Copia
                      </ModernButton>
                    </div>

                    <div className="relative">
                      <textarea
                        className="w-full h-96 bg-slate-900 text-green-400 border-4 border-indigo-500 rounded-2xl p-6 font-mono text-sm leading-relaxed focus:border-purple-500 focus:ring-4 focus:ring-purple-300 transition-all"
                        value={jsonIO}
                        onChange={(e) => setJsonIO(e.target.value)}
                        placeholder='{"players": [...], "rounds": [...], "games": [...]}'
                      />
                      <div className="absolute top-4 right-4 px-3 py-2 bg-slate-700/90 backdrop-blur-sm rounded-xl text-sm text-green-400 font-mono font-bold">
                        JSON
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-blue-100 rounded-2xl border-2 border-blue-300">
                      <HiSparkles className="text-3xl text-blue-600 flex-shrink-0" />
                      <div className="text-sm text-blue-800 font-semibold">
                        <p className="font-black mb-2 text-lg">Come salvare:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Clicca "Aggiorna JSON" per generare il salvataggio</li>
                          <li>Copia il testo o salvalo in un file</li>
                          <li>Per ripristinare: incolla il JSON e clicca "Importa JSON"</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <ModernButton variant="secondary" onClick={() => setShowExportModal(false)}>
                      Chiudi
                    </ModernButton>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
