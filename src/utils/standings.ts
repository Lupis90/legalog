import type { Player, RoundData, StandingRow } from "../types";

/**
 * Calculate standings with tie-breakers
 */

/**
 * Calculate Strength of Schedule (SOS) for all players
 */
function calculateSOS(
  rounds: RoundData[],
  playerMap: Record<string, Player>
): Record<string, number> {
  const sos: Record<string, number> = {};

  rounds.forEach((r) => {
    r.tables.forEach((t) => {
      t.players.forEach((a) => {
        sos[a] = sos[a] || 0;
        t.players.forEach((b) => {
          if (a === b) return;
          sos[a] += playerMap[b]?.total || 0;
        });
      });
    });
  });

  return sos;
}

/**
 * Calculate head-to-head records between all players
 */
function calculateH2H(
  rounds: RoundData[]
): Record<string, Record<string, number>> {
  const h2h: Record<string, Record<string, number>> = {};

  rounds.forEach((r) => {
    r.tables.forEach((t) => {
      t.players.forEach((a) => {
        t.players.forEach((b) => {
          if (a === b) return;

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

  return h2h;
}

/**
 * Generate sorted standings with all tie-breakers
 */
export function calculateStandings(
  players: Player[],
  rounds: RoundData[],
  playerMap: Record<string, Player>
): StandingRow[] {
  const sos = calculateSOS(rounds, playerMap);
  const h2h = calculateH2H(rounds);

  const rows = players.map((p) => {
    // Calculate round scores with manual adjustments applied
    const roundScoresWithAdjustments = p.roundPoints.map((baseScore, idx) => {
      const adjustment = p.manualAdjustments?.[idx] || 0;
      return baseScore + adjustment;
    });

    return {
      id: p.id,
      name: p.name,
      total: p.total,
      wins: p.wins,
      sos: Number((sos[p.id] || 0).toFixed(2)),
      h2h: h2h[p.id] || {},
      rounds: roundScoresWithAdjustments,
      games: p.gamesPlayed,
    };
  });

  // Sort with tie-breakers: total → SOS → wins → H2H → name
  rows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.sos !== a.sos) return b.sos - a.sos;
    if (b.wins !== a.wins) return b.wins - a.wins;

    const d = (a.h2h[b.id] || 0) - (b.h2h[a.id] || 0);
    if (d !== 0) return -d;

    return a.name.localeCompare(b.name);
  });

  return rows;
}
