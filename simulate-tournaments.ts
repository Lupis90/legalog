/**
 * Tournament Balance Simulator
 *
 * Simulates multiple tournaments with random results to analyze:
 * - Distribution of final positions across starting positions
 * - Impact of bonuses (Hot Streak, Arcinemico)
 * - Point distribution fairness
 * - Promotion/demotion patterns
 */

type TableLetter = 'A' | 'B' | 'C' | 'D';

interface Player {
  id: number;
  name: string;
  totalPoints: number;
  roundPoints: number[];
  gamesPlayed: string[];
  wins: number;
  hotStreakTriggered: boolean;
  _lastWasWin?: boolean;
}

interface TableResult {
  players: number[];
  game: string;
  positions: Record<number, number>;
}

interface RoundData {
  tables: Record<TableLetter, TableResult>;
}

interface SimulationStats {
  tournamentId: number;
  finalStandings: Array<{
    playerId: number;
    startingPosition: number;
    finalPosition: number;
    totalPoints: number;
    wins: number;
    hotStreakBonus: number;
    arcinimicoBonus: number;
  }>;
  pointDistribution: number[];
  promotionDemotionMatrix: number[][];
}

// Available games pool
const GAMES = [
  "Brass Birmingham", "Dune Imperium", "Terraforming Mars", "Wingspan",
  "Ark Nova", "Spirit Island", "Scythe", "Gloomhaven",
  "Root", "Everdell", "Viticulture", "Great Western Trail",
  "Lost Ruins of Arnak", "Concordia", "Castles of Burgundy", "7 Wonders Duel"
];

const TABLES: TableLetter[] = ['A', 'B', 'C', 'D'];

function createPlayers(): Player[] {
  return Array.from({ length: 16 }, (_, i) => ({
    id: i,
    name: `Player ${i + 1}`,
    totalPoints: 0,
    roundPoints: [],
    gamesPlayed: [],
    wins: 0,
    hotStreakTriggered: false,
    _lastWasWin: false,
  }));
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomGame(excludeGames: string[]): string {
  const available = GAMES.filter(g => !excludeGames.includes(g));
  return available[Math.floor(Math.random() * available.length)];
}

function generateRandomPositions(playerIds: number[]): Record<number, number> {
  const positions: Record<number, number> = {};
  const shuffled = shuffleArray(playerIds);

  // Simple random placement (1st, 2nd, 3rd, 4th)
  shuffled.forEach((playerId, index) => {
    positions[playerId] = index + 1;
  });

  return positions;
}

function calculateBasePoints(position: number, tableSize: number): number {
  if (tableSize === 4) {
    const points = [7, 5, 4, 2];
    return points[position - 1] || 0;
  } else if (tableSize === 3) {
    const points = [6, 4, 2];
    return points[position - 1] || 0;
  }
  return 0;
}

function getRoundMultiplier(round: number): number {
  if (round === 3) return 1.15;
  if (round === 4) return 1.3;
  return 1;
}

function calculateSOS(playerId: number, players: Player[], meetingsMap: Record<string, number>): number {
  let sos = 0;
  for (let opponentId = 0; opponentId < players.length; opponentId++) {
    if (opponentId !== playerId) {
      const key = [playerId, opponentId].sort((a, b) => a - b).join('-');
      const meetings = meetingsMap[key] || 0;
      if (meetings > 0) {
        sos += players[opponentId].totalPoints;
      }
    }
  }
  return sos;
}

function sortPlayersByStandings(players: Player[], meetingsMap: Record<string, number>): Player[] {
  return [...players].sort((a, b) => {
    // 1. Total points
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;

    // 2. SOS
    const sosA = calculateSOS(a.id, players, meetingsMap);
    const sosB = calculateSOS(b.id, players, meetingsMap);
    if (sosB !== sosA) return sosB - sosA;

    // 3. Wins
    if (b.wins !== a.wins) return b.wins - a.wins;

    // 4. Player ID (stable sort)
    return a.id - b.id;
  });
}

function simulateRound(
  roundNum: number,
  players: Player[],
  tableAssignments: Record<TableLetter, number[]>,
  meetingsMap: Record<string, number>,
  arcinimicoTracker: Record<number, number>
): void {
  const multiplier = getRoundMultiplier(roundNum);

  for (const tableLetter of TABLES) {
    const playerIds = tableAssignments[tableLetter];
    if (playerIds.length === 0) continue;

    // Select random game that none have played
    const gamesPlayed = playerIds.flatMap(id => players[id].gamesPlayed);
    const game = getRandomGame(gamesPlayed);

    // Generate random positions
    const positions = generateRandomPositions(playerIds);

    // Update meetings
    for (let i = 0; i < playerIds.length; i++) {
      for (let j = i + 1; j < playerIds.length; j++) {
        const key = [playerIds[i], playerIds[j]].sort((a, b) => a - b).join('-');
        meetingsMap[key] = (meetingsMap[key] || 0) + 1;
      }
    }

    // Calculate scores
    const tableSize = playerIds.length;

    for (const playerId of playerIds) {
      const player = players[playerId];
      const position = positions[playerId];
      const isWin = position === 1;

      let basePoints = calculateBasePoints(position, tableSize);
      let bonuses = 0;

      // Hot Streak bonus
      if (isWin && player._lastWasWin && !player.hotStreakTriggered) {
        bonuses += 1;
        player.hotStreakTriggered = true;
      }

      // Arcinemico bonus
      for (const opponentId of playerIds) {
        if (opponentId === playerId) continue;
        const key = [playerId, opponentId].sort((a, b) => a - b).join('-');
        if (meetingsMap[key] >= 3) {
          if (isWin) {
            bonuses += 1;
            arcinimicoTracker[playerId] = (arcinimicoTracker[playerId] || 0) + 1 * multiplier;
          } else if (positions[opponentId] === 1) {
            bonuses -= 1;
            arcinimicoTracker[playerId] = (arcinimicoTracker[playerId] || 0) - 1 * multiplier;
          }
        }
      }

      // Cap bonuses
      bonuses = Math.max(-3, Math.min(3, bonuses));

      const finalPoints = (basePoints + bonuses) * multiplier;

      player.totalPoints += finalPoints;
      player.roundPoints.push(finalPoints);
      player.gamesPlayed.push(game);

      if (isWin) {
        player.wins += 1;
        player._lastWasWin = true;
      } else {
        player._lastWasWin = false;
      }
    }
  }
}

function generateNextRoundAssignments(
  players: Player[],
  meetingsMap: Record<string, number>
): Record<TableLetter, number[]> {
  const sorted = sortPlayersByStandings(players, meetingsMap);
  const assignments: Record<TableLetter, number[]> = { A: [], B: [], C: [], D: [] };

  for (let i = 0; i < 16; i++) {
    const tableIndex = Math.floor(i / 4);
    assignments[TABLES[tableIndex]].push(sorted[i].id);
  }

  return assignments;
}

function simulateTournament(tournamentId: number): SimulationStats {
  const players = createPlayers();
  const meetingsMap: Record<string, number> = {};
  const startingPositions: Record<number, number> = {};

  // Track bonuses
  const hotStreakBonuses: Record<number, number> = {};
  const arcinemicoBonuses: Record<number, number> = {};

  players.forEach(p => {
    hotStreakBonuses[p.id] = 0;
    arcinemicoBonuses[p.id] = 0;
  });

  // Round 1: Random seeding
  let tableAssignments = generateNextRoundAssignments(shuffleArray(players), {});

  // Store starting positions
  for (const tableLetter of TABLES) {
    const playerIds = tableAssignments[tableLetter];
    playerIds.forEach((playerId, index) => {
      startingPositions[playerId] = TABLES.indexOf(tableLetter) * 4 + index + 1;
    });
  }

  // Simulate 4 rounds
  for (let round = 1; round <= 4; round++) {
    const playersBefore = deepClone(players);

    simulateRound(round, players, tableAssignments, meetingsMap, arcinemicoBonuses);

    // Track Hot Streak bonuses added this round
    for (const player of players) {
      if (player.hotStreakTriggered && !playersBefore.find(p => p.id === player.id)?.hotStreakTriggered) {
        hotStreakBonuses[player.id] += getRoundMultiplier(round);
      }
    }

    // Generate next round assignments (except after R4)
    if (round < 4) {
      tableAssignments = generateNextRoundAssignments(players, meetingsMap);
    }
  }

  // Final standings
  const finalStandings = sortPlayersByStandings(players, meetingsMap);

  // Build promotion/demotion matrix (16x16: from starting pos to final pos)
  const matrix: number[][] = Array(16).fill(0).map(() => Array(16).fill(0));

  const stats: SimulationStats = {
    tournamentId,
    finalStandings: finalStandings.map((player, index) => ({
      playerId: player.id,
      startingPosition: startingPositions[player.id],
      finalPosition: index + 1,
      totalPoints: player.totalPoints,
      wins: player.wins,
      hotStreakBonus: hotStreakBonuses[player.id],
      arcinimicoBonus: arcinemicoBonuses[player.id],
    })),
    pointDistribution: players.map(p => p.totalPoints),
    promotionDemotionMatrix: matrix,
  };

  // Fill matrix
  stats.finalStandings.forEach(standing => {
    const startIdx = standing.startingPosition - 1;
    const finalIdx = standing.finalPosition - 1;
    matrix[startIdx][finalIdx] += 1;
  });

  return stats;
}

function aggregateStats(allStats: SimulationStats[]): void {
  const numTournaments = allStats.length;

  console.log('\n=== TOURNAMENT BALANCE ANALYSIS ===\n');
  console.log(`Simulated ${numTournaments} tournaments with random results\n`);

  // 1. Starting position advantage
  console.log('1. STARTING POSITION IMPACT\n');
  console.log('Average final position by starting position:\n');

  const avgFinalByStart: number[] = Array(16).fill(0);
  const countByStart: number[] = Array(16).fill(0);

  allStats.forEach(stat => {
    stat.finalStandings.forEach(standing => {
      avgFinalByStart[standing.startingPosition - 1] += standing.finalPosition;
      countByStart[standing.startingPosition - 1] += 1;
    });
  });

  console.log('Start Pos | Avg Final Pos | Expected (random) | Deviation');
  console.log('----------|---------------|-------------------|----------');

  for (let i = 0; i < 16; i++) {
    const avg = avgFinalByStart[i] / countByStart[i];
    const expected = 8.5; // Average position in random distribution
    const deviation = avg - expected;
    const startPos = (i + 1).toString().padStart(2);
    const avgStr = avg.toFixed(2).padStart(5);
    const devStr = (deviation >= 0 ? '+' : '') + deviation.toFixed(2);

    console.log(`${startPos}        | ${avgStr}         | 8.50              | ${devStr}`);
  }

  // 2. Point distribution
  console.log('\n2. POINT DISTRIBUTION\n');

  const allPoints = allStats.flatMap(s => s.pointDistribution);
  const avgPoints = allPoints.reduce((a, b) => a + b, 0) / allPoints.length;
  const sortedPoints = [...allPoints].sort((a, b) => a - b);
  const minPoints = sortedPoints[0];
  const maxPoints = sortedPoints[sortedPoints.length - 1];
  const medianPoints = sortedPoints[Math.floor(sortedPoints.length / 2)];

  console.log(`Average total points: ${avgPoints.toFixed(2)}`);
  console.log(`Median total points: ${medianPoints.toFixed(2)}`);
  console.log(`Min total points: ${minPoints.toFixed(2)}`);
  console.log(`Max total points: ${maxPoints.toFixed(2)}`);
  console.log(`Point spread (max-min): ${(maxPoints - minPoints).toFixed(2)}`);

  // Standard deviation
  const variance = allPoints.reduce((sum, p) => sum + Math.pow(p - avgPoints, 2), 0) / allPoints.length;
  const stdDev = Math.sqrt(variance);
  console.log(`Standard deviation: ${stdDev.toFixed(2)}`);

  // 3. Win distribution
  console.log('\n3. WIN DISTRIBUTION\n');

  const winCounts: number[] = [];
  allStats.forEach(stat => {
    stat.finalStandings.forEach(standing => {
      winCounts.push(standing.wins);
    });
  });

  const avgWins = winCounts.reduce((a, b) => a + b, 0) / winCounts.length;
  const winDistribution: Record<number, number> = {};

  winCounts.forEach(w => {
    winDistribution[w] = (winDistribution[w] || 0) + 1;
  });

  console.log(`Average wins per player: ${avgWins.toFixed(2)}`);
  console.log('\nWin count distribution:');
  console.log('Wins | Count | Percentage');
  console.log('-----|-------|----------');

  Object.keys(winDistribution).sort((a, b) => parseInt(a) - parseInt(b)).forEach(wins => {
    const count = winDistribution[parseInt(wins)];
    const pct = ((count / winCounts.length) * 100).toFixed(1);
    console.log(`${wins.padStart(4)} | ${count.toString().padStart(5)} | ${pct}%`);
  });

  // 4. Bonus impact
  console.log('\n4. BONUS IMPACT\n');

  const hotStreakCounts = { triggered: 0, total: 0 };
  const hotStreakPoints: number[] = [];

  allStats.forEach(stat => {
    stat.finalStandings.forEach(standing => {
      hotStreakCounts.total += 1;
      if (standing.hotStreakBonus > 0) {
        hotStreakCounts.triggered += 1;
        hotStreakPoints.push(standing.hotStreakBonus);
      }
    });
  });

  const hotStreakRate = (hotStreakCounts.triggered / hotStreakCounts.total) * 100;
  const avgHotStreakBonus = hotStreakPoints.length > 0
    ? hotStreakPoints.reduce((a, b) => a + b, 0) / hotStreakPoints.length
    : 0;

  console.log(`Hot Streak trigger rate: ${hotStreakRate.toFixed(1)}%`);
  console.log(`Average Hot Streak bonus (when triggered): ${avgHotStreakBonus.toFixed(2)} points`);

  // Arcinemico stats
  const arcinimicoValues: number[] = [];
  const arcinimicoPositive: number[] = [];
  const arcinimicoNegative: number[] = [];
  const arcinimicoTriggered = { count: 0, total: 0 };

  allStats.forEach(stat => {
    stat.finalStandings.forEach(standing => {
      arcinimicoTriggered.total += 1;
      if (standing.arcinimicoBonus !== 0) {
        arcinimicoTriggered.count += 1;
        arcinimicoValues.push(standing.arcinimicoBonus);
        if (standing.arcinimicoBonus > 0) {
          arcinimicoPositive.push(standing.arcinimicoBonus);
        } else {
          arcinimicoNegative.push(standing.arcinimicoBonus);
        }
      }
    });
  });

  const arcinimicoRate = (arcinimicoTriggered.count / arcinimicoTriggered.total) * 100;
  const avgArcinimicoBonus = arcinimicoValues.length > 0
    ? arcinimicoValues.reduce((a, b) => a + b, 0) / arcinimicoValues.length
    : 0;
  const avgArcinimicoPositive = arcinimicoPositive.length > 0
    ? arcinimicoPositive.reduce((a, b) => a + b, 0) / arcinimicoPositive.length
    : 0;
  const avgArcinimicoNegative = arcinimicoNegative.length > 0
    ? arcinimicoNegative.reduce((a, b) => a + b, 0) / arcinimicoNegative.length
    : 0;

  console.log(`\nArcinemico trigger rate: ${arcinimicoRate.toFixed(1)}%`);
  console.log(`Average Arcinemico impact (when triggered): ${avgArcinimicoBonus.toFixed(2)} points`);
  console.log(`  - Positive (winner): ${avgArcinimicoPositive.toFixed(2)} points (${arcinimicoPositive.length} instances)`);
  console.log(`  - Negative (loser): ${avgArcinimicoNegative.toFixed(2)} points (${arcinimicoNegative.length} instances)`);

  // 5. Mobility matrix (aggregated)
  console.log('\n5. POSITION MOBILITY MATRIX\n');
  console.log('Shows probability of moving from starting position (row) to final position (column)\n');

  const aggregatedMatrix: number[][] = Array(16).fill(0).map(() => Array(16).fill(0));

  allStats.forEach(stat => {
    stat.finalStandings.forEach(standing => {
      const startIdx = standing.startingPosition - 1;
      const finalIdx = standing.finalPosition - 1;
      aggregatedMatrix[startIdx][finalIdx] += 1;
    });
  });

  // Normalize to percentages
  for (let i = 0; i < 16; i++) {
    const total = aggregatedMatrix[i].reduce((a, b) => a + b, 0);
    for (let j = 0; j < 16; j++) {
      aggregatedMatrix[i][j] = (aggregatedMatrix[i][j] / total) * 100;
    }
  }

  // Print condensed version (top 4, middle 4, bottom 4)
  const posGroups = [
    { name: 'Top 4', start: 0, end: 4 },
    { name: 'Middle 4', start: 4, end: 8 },
    { name: 'Bottom 4', start: 12, end: 16 },
  ];

  console.log('Starting Position Group → Final Position Group:');
  console.log('Start Group  | Top 4  | Mid-Top | Mid-Bot | Bottom 4');
  console.log('-------------|--------|---------|---------|----------');

  for (const startGroup of posGroups) {
    let top4 = 0, midTop = 0, midBot = 0, bottom4 = 0;

    for (let i = startGroup.start; i < startGroup.end; i++) {
      for (let j = 0; j < 4; j++) top4 += aggregatedMatrix[i][j];
      for (let j = 4; j < 8; j++) midTop += aggregatedMatrix[i][j];
      for (let j = 8; j < 12; j++) midBot += aggregatedMatrix[i][j];
      for (let j = 12; j < 16; j++) bottom4 += aggregatedMatrix[i][j];
    }

    const count = startGroup.end - startGroup.start;
    top4 /= count;
    midTop /= count;
    midBot /= count;
    bottom4 /= count;

    const name = startGroup.name.padEnd(12);
    console.log(`${name} | ${top4.toFixed(1)}% | ${midTop.toFixed(1)}%  | ${midBot.toFixed(1)}%  | ${bottom4.toFixed(1)}%`);
  }

  // 6. Balance score
  console.log('\n6. BALANCE ASSESSMENT\n');

  // Check if starting position has too much impact
  const maxDeviation = Math.max(...avgFinalByStart.map((avg, i) => Math.abs(avg / countByStart[i] - 8.5)));

  console.log(`Max deviation from random (starting pos advantage): ${maxDeviation.toFixed(2)} positions`);

  if (maxDeviation < 1.0) {
    console.log('✓ Excellent: Starting position has minimal impact');
  } else if (maxDeviation < 2.0) {
    console.log('✓ Good: Starting position has acceptable impact');
  } else if (maxDeviation < 3.0) {
    console.log('⚠ Fair: Starting position has moderate impact');
  } else {
    console.log('✗ Poor: Starting position has significant impact');
  }

  // Check point spread
  const avgSpread = maxPoints - minPoints;
  console.log(`\nAverage point spread: ${avgSpread.toFixed(2)}`);

  if (stdDev < avgPoints * 0.15) {
    console.log('✓ Good point compression (competitive tournaments)');
  } else if (stdDev < avgPoints * 0.25) {
    console.log('⚠ Moderate point spread');
  } else {
    console.log('✗ High point spread (potential runaway leaders)');
  }
}

// Run simulation
console.log('Starting tournament simulation...\n');

const allStats: SimulationStats[] = [];
const numSimulations = 1000;

for (let i = 0; i < numSimulations; i++) {
  const stats = simulateTournament(i + 1);
  allStats.push(stats);

  if ((i + 1) % 10 === 0) {
    console.log(`Completed ${i + 1}/${numSimulations} tournaments...`);
  }
}

aggregateStats(allStats);

console.log('\n=== SIMULATION COMPLETE ===\n');
