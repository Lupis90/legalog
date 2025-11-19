import type { Player, TableResult, ScoringConfig } from "../types";
import { keyPair } from "./helpers";

/**
 * Scoring utilities for LOG League
 */

/**
 * Calculate base points for a given position based on table size
 * Handles ties by averaging points
 */
export function basePointsForPositions(
  size: number,
  posNumbers: number[],
  config: ScoringConfig
): number {
  let table: Record<number, number>;

  if (size === 5) {
    // Fallback or separate config for 5 players if needed, for now using hardcoded or derived
    // Assuming config only has 4-player base points as per request, but we should handle 5/3 if possible.
    // The user request specifically mentioned "quanti punti prende il primo posto... quarto".
    // It didn't explicitly mention 3 or 5 player tables.
    // For now, let's map 4-player config to others or keep constants for non-standard sizes if not in config.
    // Actually, let's look at how it was:
    // BASE_POINTS_5 = { 1: 7, 2: 5, 3: 3, 4: 2, 5: 1 }
    // BASE_POINTS_3 = { 1: 6, 2: 4, 3: 2 }
    // BASE_POINTS_4 = { 1: 6, 2: 4, 3: 3, 4: 2 }

    // If we change 1st place in 4-player, should it change in 5-player?
    // Let's use the config for 4-player and derive or keep others constant for now, 
    // BUT the user might expect it to apply everywhere.
    // Given the prompt "quanti punti prende il primo... quarto", it implies modifying the main scoring.
    // Let's use the config.basePoints for 4-player tables.
    // For 3 and 5, we might need to be careful.
    // Let's assume the config provided is for the standard 4-player table.
    // We can try to adapt it or just use the config values if they match the position.

    // Current implementation uses constants. I will use the config for 4-player.
    // For 3 and 5, I'll stick to the constants for now unless I add them to config.
    // Wait, I only added basePoints for 1-4 in ScoringConfig.
    // So for size 5, I should probably stick to constants or try to be smart.
    // Let's keep using constants for 3 and 5 for safety, or better, import them again?
    // I removed the import. I should re-add the import for 3 and 5 or add them to config.
    // I'll re-add the import for 3 and 5.

    // Actually, I'll just use the config for 1-4 and constants for others to avoid breaking 3/5 player tables.
    // But I removed the import. I will fix the import in the first chunk or use hardcoded values here.
    // Let's use hardcoded values for 3 and 5 for now to match previous constants, 
    // but ideally they should be in config too.
    // The user asked for "quanti punti prende il primo... quarto".

    table = { 1: 7, 2: 5, 3: 3, 4: 2, 5: 1 }; // BASE_POINTS_5
  } else if (size === 3) {
    table = { 1: 6, 2: 4, 3: 2 }; // BASE_POINTS_3
  } else {
    table = config.basePoints;
  }

  const sum = posNumbers.reduce((acc, p) => acc + (table[p] ?? 0), 0);
  return sum / posNumbers.length;
}

/**
 * Calculate base points for each player in a round
 */
export function calculateBasePoints(
  tables: TableResult[],
  config: ScoringConfig
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
      const positionsRange = Array.from({ length: ids.length }, (_, i) => p + i);
      const base = basePointsForPositions(size, positionsRange, config);
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
  prevMeetings: Record<string, number>,
  config: ScoringConfig
): Record<string, number> {
  const perPlayerBonusRaw: Record<string, number> = {};

  // Track if player has already received Arcinemico bonus this round (max ±1 per round)
  const archnemicoApplied: Record<string, boolean> = {};

  tables.forEach((table) => {
    const posOf: Record<string, number> = {};
    table.players.forEach((pid) => {
      posOf[pid] = table.positions[pid]!;
    });

    // Arcinemico bonus (3rd meeting) - max ±1 per player per round
    for (let i = 0; i < table.players.length; i++) {
      for (let j = i + 1; j < table.players.length; j++) {
        const a = table.players[i];
        const b = table.players[j];
        const k = keyPair(a, b);
        const met = prevMeetings[k] || 0;
        // ARCINEMICO_THRESHOLD is 2 (3rd meeting)
        const ARCINEMICO_THRESHOLD = 2;

        if (met >= ARCINEMICO_THRESHOLD) {
          const pa = posOf[a];
          const pb = posOf[b];
          if (pa !== pb) {
            const winner = pa < pb ? a : b;
            const loser = pa < pb ? b : a;

            // Apply bonus only if not already applied this round
            if (!archnemicoApplied[winner]) {
              perPlayerBonusRaw[winner] = (perPlayerBonusRaw[winner] || 0) + config.bonuses.arcinemico;
              archnemicoApplied[winner] = true;
            }
            if (!archnemicoApplied[loser]) {
              perPlayerBonusRaw[loser] = (perPlayerBonusRaw[loser] || 0) - config.bonuses.arcinemico;
              archnemicoApplied[loser] = true;
            }
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

      if (won && wonPrev) {
        perPlayerBonusRaw[pid] = (perPlayerBonusRaw[pid] || 0) + config.bonuses.hotStreak;
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
  multiplier: number,
  maxBonus: number
): Record<string, number> {
  const perPlayerRoundTotal: Record<string, number> = {};

  playerIds.forEach((pid) => {
    const base = basePoints[pid] ?? 0;
    const rawBonus = bonuses[pid] ?? 0;
    const bonus = Math.min(maxBonus, rawBonus);
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
