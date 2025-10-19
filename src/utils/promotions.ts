import type { Player, RoundData, TableLetter, TableResult } from "../types";
import { TABLES } from "../constants";

/**
 * Promotion/Demotion algorithm for LOG League
 */

/**
 * Pick top/bottom K players with tie-breaking at boundaries
 */
function pickWithBoundary(
  arr: { pid: string; pos: number }[],
  k: number,
  byId: Record<string, Player>
): string[] {
  if (arr.length <= k) return arr.map((x) => x.pid);

  const edgePos = arr[k - 1].pos;
  const block = arr.filter((x) => x.pos === edgePos);

  // No tie at boundary
  if (block.length === 1) return arr.slice(0, k).map((x) => x.pid);

  // Tie at boundary - use cumulative points to break
  const start = arr.findIndex((x) => x.pos === edgePos);
  const end = start + block.length;
  const fixed = arr.slice(0, start);
  const contenders = arr.slice(start, end);

  // Sort tied players by total points
  contenders.sort((a, b) => byId[b.pid].total - byId[a.pid].total);

  const need = Math.max(0, k - fixed.length);
  const picked = contenders.slice(0, need).map((x) => x.pid);

  // If still tied after sorting, pick randomly
  while (picked.length < need) {
    const rest = contenders.filter((x) => !picked.includes(x.pid));
    if (rest.length === 0) break;
    const r = rest[Math.floor(Math.random() * rest.length)];
    picked.push(r.pid);
  }

  return [...fixed.map((x) => x.pid), ...picked];
}

/**
 * Determine winners and losers for a table
 */
function decideWinnersLosers(
  t: TableResult,
  byId: Record<string, Player>
): { winners: string[]; losers: string[] } {
  const entries = t.players.map((pid) => ({
    pid,
    pos: t.positions[pid]!,
  }));

  entries.sort((a, b) => a.pos - b.pos);
  const sorted = entries.slice();

  const top = pickWithBoundary(sorted, 2, byId);
  const bottom = pickWithBoundary(sorted.slice().reverse(), 2, byId);

  return { winners: top, losers: bottom };
}

/**
 * Rebalance tables to maintain target size (default 4)
 */
function rebalance(
  next: Record<TableLetter, string[]>,
  targetSize = 4
): void {
  const deficit = () => TABLES.filter((t) => next[t].length < targetSize);
  const surplus = () => TABLES.filter((t) => next[t].length > targetSize);

  let guard = 50;
  while (deficit().length && surplus().length && guard-- > 0) {
    const d = deficit()[0];
    const di = TABLES.indexOf(d);
    const candidates = [di - 1, di + 1]
      .filter((x) => x >= 0 && x < TABLES.length)
      .map((i) => TABLES[i]);

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

/**
 * Compute next round's table assignments based on promotions/demotions
 */
export function computePromotions(
  round: RoundData,
  players: Player[]
): Record<TableLetter, string[]> {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const next: Record<TableLetter, string[]> = { A: [], B: [], C: [], D: [] };

  round.tables.forEach((t) => {
    const { winners, losers } = decideWinnersLosers(t, byId);
    const idx = TABLES.indexOf(t.table);
    const up = Math.max(0, idx - 1);
    const down = Math.min(TABLES.length - 1, idx + 1);

    const stayers = t.players.filter(
      (pid) => !winners.includes(pid) && !losers.includes(pid)
    );

    next[TABLES[up]].push(...winners);
    next[TABLES[down]].push(...losers);
    next[t.table].push(...stayers);
  });

  rebalance(next, 4);

  return next;
}
