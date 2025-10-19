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
