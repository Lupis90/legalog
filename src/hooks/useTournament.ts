import { toast } from "react-hot-toast";
import { useTournamentContext } from "../context/TournamentContext";
import type { TableLetter, RoundData, TableResult } from "../types";
import { TABLES, MULTIPLIER } from "../constants";
import { shuffle, deepClone } from "../utils/helpers";
import { calculateBasePoints, calculateWinners, calculateBonuses, calculateRoundTotals, updateMeetings } from "../utils/scoring";
import { computePromotions } from "../utils/promotions";

/**
 * Custom hook for tournament operations
 */

export function useTournament() {
  const {
    players,
    games,
    rounds,
    meetingsMap,
    playerMap,
    setPlayers,
    setRounds,
    setActiveRound,
    setMeetingsMap,
  } = useTournamentContext();

  /**
   * Create an empty round with table assignments
   */
  function makeEmptyRound(
    index: 1 | 2 | 3 | 4,
    tableAssignments: Record<TableLetter, string[]>
  ): RoundData {
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

  /**
   * Suggest a game for a table that no player has played
   */
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

  /**
   * Check if any player at a table has already played the selected game
   */
  function hasRepeatGameForAny(table: TableResult): boolean {
    if (!table.game) return false;
    return table.players.some((pid) => playerMap[pid]?.gamesPlayed.includes(table.game!));
  }

  /**
   * Start the tournament with R1
   */
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

  /**
   * Finalize the current round and generate next one (or end tournament)
   */
  function finalizeRound(roundIdx0: number) {
    const rs = deepClone(rounds);
    const round = rs[roundIdx0];

    // Validation
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

    // Calculate scoring
    const perPlayerRoundBase = calculateBasePoints(round.tables);
    calculateWinners(round.tables);
    const perPlayerBonusRaw = calculateBonuses(round.tables, playerMap, meetingsMap);
    const perPlayerRoundTotal = calculateRoundTotals(
      players.map((p) => p.id),
      perPlayerRoundBase,
      perPlayerBonusRaw,
      multiplier
    );

    // Update players
    const nextPlayers = players.map((pl) => ({ ...pl }));
    const idxById = Object.fromEntries(nextPlayers.map((p, i) => [p.id, i]));

    // Update meetings
    const nextMeetings = updateMeetings(round.tables, meetingsMap);

    // Apply results to players
    round.tables.forEach((table) => {
      table.players.forEach((pid) => {
        const i = idxById[pid];
        const add = perPlayerRoundTotal[pid] || 0;

        nextPlayers[i].total = Number((nextPlayers[i].total + add).toFixed(2));
        nextPlayers[i].roundPoints = [...nextPlayers[i].roundPoints, add];

        const isWin = table.positions[pid]! === 1;
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

    // Generate next round or end tournament
    if (round.index < 4) {
      const nextAssignments = computePromotions(round, nextPlayers);
      const nextR = makeEmptyRound((round.index + 1) as 2 | 3 | 4, nextAssignments);
      nextR.tables.forEach((tbl) => {
        tbl.game = suggestGameForTable(tbl.players);
      });

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

  return {
    suggestGameForTable,
    hasRepeatGameForAny,
    startTournament,
    finalizeRound,
  };
}
