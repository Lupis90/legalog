/**
 * TypeScript type definitions for LOG League application
 */

export const TABLES = ["A", "B", "C", "D"] as const;
export type TableLetter = typeof TABLES[number];

export type Player = {
  id: string;
  name: string;
  total: number;
  roundPoints: number[];
  wins: number;
  gamesPlayed: string[];
  hotStreakTriggered: boolean;
  manualAdjustments?: Record<number, number>; // roundIndex -> adjustment value
};

export type TableResult = {
  table: TableLetter;
  game: string | null;
  players: string[];
  positions: Record<string, number | null>;
};

export type RoundData = {
  index: 1 | 2 | 3 | 4;
  tables: TableResult[];
};

export type Game = {
  title: string;
  weight: number;
  duration: string;
};

export type StandingRow = {
  id: string;
  name: string;
  total: number;
  wins: number;
  sos: number;
  h2h: Record<string, number>;
  rounds: number[];
  games: string[];
};
