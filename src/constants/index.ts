import type { Game } from "../types";

/**
 * Constants and configuration for LOG League
 */

export const TABLES = ["A", "B", "C", "D"] as const;

export const MULTIPLIER: Record<number, number> = {
  1: 1,
  2: 1,
  3: 1.25,
  4: 1.5,
};

export const BASE_POINTS_4 = { 1: 7, 2: 5, 3: 3, 4: 1 } as const;
export const BASE_POINTS_3 = { 1: 7, 2: 4, 3: 2 } as const;

export const DEFAULT_GAMES: Game[] = [
  { title: "7 Wonders", weight: 2.29, duration: "30 min" },
  { title: "Splendor", weight: 1.78, duration: "30 min" },
  { title: "Azul", weight: 1.77, duration: "45 min" },
  { title: "Harmonies", weight: 2.01, duration: "45 min" },
  { title: "Faraway", weight: 1.91, duration: "30 min" },
  { title: "Cities", weight: 1.92, duration: "45 min" },
  { title: "Heat: Pedal to the Metal", weight: 2.20, duration: "45 min" },
  { title: "Ticket to Ride Europe", weight: 1.92, duration: "45 min" },
];

export const MAX_BONUS_POINTS = 3;
export const HOT_STREAK_BONUS = 1;
export const ARCINEMICO_BONUS = 1;
export const ARCINEMICO_THRESHOLD = 2; // 3rd meeting (index 2)

/**
 * Fixed game assignment schema per round
 * Keys are table letters (A, B, C, D), values are game titles from DEFAULT_GAMES
 * Schema from user specification:
 * Round 1: T1→A, T2→B, T3→C, T4→D
 * Round 2: T1→C, T2→B, T3→A, T4→E
 * Round 3: T1→D, T2→F, T3→G, T4→H
 * Round 4: T1→E, T2→H, T3→G, T4→F
 */
export const GAME_SCHEMA: Record<number, Record<string, string>> = {
  1: {
    A: "7 Wonders",          // Table A (T1) → game A
    B: "Splendor",           // Table B (T2) → game B
    C: "Azul",               // Table C (T3) → game C
    D: "Harmonies",          // Table D (T4) → game D
  },
  2: {
    A: "Azul",               // Table A (T1) → game C
    B: "Splendor",           // Table B (T2) → game B
    C: "7 Wonders",          // Table C (T3) → game A
    D: "Faraway",            // Table D (T4) → game E
  },
  3: {
    A: "Harmonies",          // Table A (T1) → game D
    B: "Cities",             // Table B (T2) → game F
    C: "Heat: Pedal to the Metal",  // Table C (T3) → game G
    D: "Ticket to Ride Europe",     // Table D (T4) → game H
  },
  4: {
    A: "Faraway",            // Table A (T1) → game E
    B: "Ticket to Ride Europe",     // Table B (T2) → game H
    C: "Heat: Pedal to the Metal",  // Table C (T3) → game G
    D: "Cities",             // Table D (T4) → game F
  },
};
