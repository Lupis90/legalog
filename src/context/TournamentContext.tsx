import { createContext, useContext, useState, useMemo } from "react";
import type { ReactNode } from "react";
import type { Player, Game, RoundData, TableLetter, StandingRow } from "../types";
import { DEFAULT_GAMES } from "../constants";
import { uid, deepClone } from "../utils/helpers";
import { calculateStandings } from "../utils/standings";

/**
 * Tournament Context for global state management
 */

interface TournamentContextType {
  // State
  players: Player[];
  games: Game[];
  rounds: RoundData[];
  activeRound: 0 | 1 | 2 | 3 | 4;
  meetingsMap: Record<string, number>;

  // Derived state
  playerMap: Record<string, Player>;
  gamesByTitle: Map<string, Game>;
  standings: StandingRow[];
  currentRound: RoundData | null;

  // Player actions
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  updatePlayerName: (id: string, name: string) => void;
  addPlayer: () => void;
  removeLastPlayer: () => void;

  // Game actions
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  updateGame: (index: number, field: keyof Game, value: string | number) => void;
  removeGame: (index: number) => void;
  addGame: () => void;

  // Round actions
  setRounds: React.Dispatch<React.SetStateAction<RoundData[]>>;
  setActiveRound: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3 | 4>>;
  setMeetingsMap: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  updatePosition: (roundIndex: number, table: TableLetter, playerId: string, position: number | null) => void;
  setGameForTable: (roundIndex: number, table: TableLetter, gameTitle: string) => void;

  // Import/Export
  exportData: () => { players: Player[]; games: Game[]; rounds: RoundData[]; meetingsMap: Record<string, number> };
  importData: (data: { players: Player[]; games: Game[]; rounds: RoundData[]; meetingsMap: Record<string, number> }) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
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
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [activeRound, setActiveRound] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [meetingsMap, setMeetingsMap] = useState<Record<string, number>>({});

  // Derived state
  const playerMap = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  );

  const gamesByTitle = useMemo(
    () => new Map(games.map((g) => [g.title, g])),
    [games]
  );

  const standings = useMemo(
    () => calculateStandings(players, rounds, playerMap),
    [players, rounds, playerMap]
  );

  const currentRound = activeRound ? rounds.find((r) => r.index === activeRound) || null : null;

  // Player actions
  const addPlayer = () => {
    setPlayers((ps) => [
      ...ps,
      {
        id: uid(),
        name: `Giocatore ${ps.length + 1}`,
        total: 0,
        roundPoints: [],
        wins: 0,
        gamesPlayed: [],
        hotStreakTriggered: false,
      },
    ]);
  };

  const removeLastPlayer = () => {
    if (players.length > 0) {
      setPlayers((ps) => ps.slice(0, -1));
    }
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  // Game actions
  const updateGame = (index: number, field: keyof Game, value: string | number) => {
    setGames((gs) => gs.map((g, idx) => (idx === index ? { ...g, [field]: value } : g)));
  };

  const removeGame = (index: number) => {
    setGames((gs) => gs.filter((_, idx) => idx !== index));
  };

  const addGame = () => {
    setGames((gs) => [
      ...gs,
      { title: `Nuovo gioco ${gs.length + 1}`, weight: 2.0, duration: "45 min" },
    ]);
  };

  // Round actions
  const updatePosition = (
    roundIndex: number,
    table: TableLetter,
    playerId: string,
    position: number | null
  ) => {
    setRounds((rs) => {
      const next = deepClone(rs);
      const r = next[roundIndex];
      const t = r.tables.find((x) => x.table === table)!;
      t.positions[playerId] = position;
      return next;
    });
  };

  const setGameForTable = (roundIndex: number, table: TableLetter, gameTitle: string) => {
    setRounds((rs) => {
      const next = deepClone(rs);
      const r = next[roundIndex];
      const t = r.tables.find((x) => x.table === table)!;
      t.game = gameTitle;
      return next;
    });
  };

  // Import/Export
  const exportData = () => ({ players, games, rounds, meetingsMap });

  const importData = (data: {
    players: Player[];
    games: Game[];
    rounds: RoundData[];
    meetingsMap: Record<string, number>;
  }) => {
    setPlayers(data.players);
    setGames(data.games || DEFAULT_GAMES);
    setRounds(data.rounds);
    setMeetingsMap(data.meetingsMap || {});
    setActiveRound(data.rounds[data.rounds.length - 1]?.index || 0);
  };

  const value: TournamentContextType = {
    // State
    players,
    games,
    rounds,
    activeRound,
    meetingsMap,

    // Derived
    playerMap,
    gamesByTitle,
    standings,
    currentRound,

    // Actions
    setPlayers,
    updatePlayerName,
    addPlayer,
    removeLastPlayer,
    setGames,
    updateGame,
    removeGame,
    addGame,
    setRounds,
    setActiveRound,
    setMeetingsMap,
    updatePosition,
    setGameForTable,
    exportData,
    importData,
  };

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>;
}

export function useTournamentContext() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournamentContext must be used within TournamentProvider");
  }
  return context;
}
