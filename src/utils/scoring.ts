import { BASE_POINTS_3, BASE_POINTS_4, MAX_BONUS_POINTS, HOT_STREAK_BONUS, ARCINEMICO_BONUS, ARCINEMICO_THRESHOLD } from "../constants";
import type { Player, TableResult } from "../types";
import { keyPair } from "./helpers";

/**
 * Scoring utilities for LOG League
 */

/**
 * Calculate base points for a given position based on table size
 * Handles ties by averaging points
 */
export function basePointsForPositions(size: number, posNumbers: number[]): number {
  if (size === 5) {
    const SCALE_5 = { 1: 8, 2: 6, 3: 4, 4: 2, 5: 1 } as const;
    const sum = posNumbers.reduce((acc, p) => acc + (SCALE_5 as any)[p], 0);
    return sum / posNumbers.length;
  }

  const table = size === 3 ? (BASE_POINTS_3 as any) : (BASE_POINTS_4 as any);
  const sum = posNumbers.reduce((acc, p) => acc + (table[p] ?? 0), 0);
  return sum / posNumbers.length;
}

/**
 * Calculate base points for each player in a round
 */
export function calculateBasePoints(
  tables: TableResult[]
): Record<string, number> {
  const perPlayerRoundBase: Record<string, number> = {};

  tables.forEach((table) => {
    const size = table.players.length;
    const groups: Record<number, string[]> = {};

    // Group players by position
    table.players.forEach((pid) => {
      const pos = table.positions[pid]! as number;
      groups[pos] = groups[pos] || [];
      groups[pos].push(pid);
    });

    // Calculate base points for each group (handles ties)
    Object.entries(groups).forEach(([posStr, ids]) => {
      const p = parseInt(posStr, 10);
      const positionsRange = ids.map(() => p);
      const base = basePointsForPositions(size, positionsRange);
      ids.forEach((pid) => {
        perPlayerRoundBase[pid] = base;
      });
    });
  });

  return perPlayerRoundBase;
}

/**
 * Identify winners (1st place players) in a round
 */
export function calculateWinners(
  tables: TableResult[]
): Record<string, boolean> {
  const perPlayerRoundWin: Record<string, boolean> = {};

  tables.forEach((table) => {
    const groups: Record<number, string[]> = {};
    table.players.forEach((pid) => {
      const pos = table.positions[pid]! as number;
      groups[pos] = groups[pos] || [];
      groups[pos].push(pid);
    });

    (groups[1] || []).forEach((pid) => {
      perPlayerRoundWin[pid] = true;
    });
  });

  return perPlayerRoundWin;
}

/**
 * Calculate bonus points (Hot Streak + Arcinemico)
 * Returns raw bonus before capping
 */
export function calculateBonuses(
  tables: TableResult[],
  playerMap: Record<string, Player>,
  prevMeetings: Record<string, number>
): Record<string, number> {
  const perPlayerBonusRaw: Record<string, number> = {};

  tables.forEach((table) => {
    const posOf: Record<string, number> = {};
    table.players.forEach((pid) => {
      posOf[pid] = table.positions[pid]!;
    });

    // Arcinemico bonus (3rd meeting)
    for (let i = 0; i < table.players.length; i++) {
      for (let j = i + 1; j < table.players.length; j++) {
        const a = table.players[i];
        const b = table.players[j];
        const k = keyPair(a, b);
        const met = prevMeetings[k] || 0;

        if (met >= ARCINEMICO_THRESHOLD) {
          const pa = posOf[a];
          const pb = posOf[b];
          if (pa !== pb) {
            const winner = pa < pb ? a : b;
            const loser = pa < pb ? b : a;
            perPlayerBonusRaw[winner] = (perPlayerBonusRaw[winner] || 0) + ARCINEMICO_BONUS;
            perPlayerBonusRaw[loser] = (perPlayerBonusRaw[loser] || 0) - ARCINEMICO_BONUS;
          }
        }
      }
    }

    // Hot Streak bonus (2nd consecutive win)
    table.players.forEach((pid) => {
      const pl = playerMap[pid];
      const won = posOf[pid] === 1;
      const prevRounds = pl.roundPoints.length;
      const wonPrev = prevRounds > 0 && (pl as any)._lastWasWin === true;

      if (won && wonPrev && !pl.hotStreakTriggered) {
        perPlayerBonusRaw[pid] = (perPlayerBonusRaw[pid] || 0) + HOT_STREAK_BONUS;
      }
    });
  });

  return perPlayerBonusRaw;
}

/**
 * Calculate final round totals with multiplier and capped bonuses
 */
export function calculateRoundTotals(
  playerIds: string[],
  basePoints: Record<string, number>,
  bonuses: Record<string, number>,
  multiplier: number
): Record<string, number> {
  const perPlayerRoundTotal: Record<string, number> = {};

  playerIds.forEach((pid) => {
    const base = basePoints[pid] ?? 0;
    const rawBonus = bonuses[pid] ?? 0;
    const bonus = Math.min(MAX_BONUS_POINTS, rawBonus);
    const total = base * multiplier + bonus;
    perPlayerRoundTotal[pid] = Number(total.toFixed(2));
  });

  return perPlayerRoundTotal;
}

/**
 * Update meetings map with new encounters from current round
 */
export function updateMeetings(
  tables: TableResult[],
  prevMeetings: Record<string, number>
): Record<string, number> {
  const nextMeetings = { ...prevMeetings };

  tables.forEach((table) => {
    for (let i = 0; i < table.players.length; i++) {
      for (let j = i + 1; j < table.players.length; j++) {
        const a = table.players[i];
        const b = table.players[j];
        const k = keyPair(a, b);
        nextMeetings[k] = (nextMeetings[k] || 0) + 1;
      }
    }
  });

  return nextMeetings;
}
