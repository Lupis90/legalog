# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LegaLog is a single-file React/TypeScript application for managing a board game tournament league called "LOG League" (Big-Game Flavor). The app tracks 16 players across 4 rounds of games on 4 tables (A-D) with promotions/demotions between rounds.

## Development Commands

The project is located in the [legalog/](legalog/) subdirectory.

```bash
cd legalog

# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Note**: The dev server runs on `http://localhost:5173/`

## Architecture

### Single-File Application
The entire application is contained in [legalog/src/App.tsx](legalog/src/App.tsx) - a single React component with no external state management libraries. All state is managed via React's `useState` and `useMemo` hooks.

### Core Data Structures

- **Player**: Tracks individual player state including:
  - Points (total and per-round breakdown)
  - Games played (enforces no-repeat rule)
  - Win count and hot streak status

- **TableResult**: Represents a single table in a round with:
  - Assigned players (typically 4, supports 3-5)
  - Game title
  - Position placements (supports ties)

- **RoundData**: Contains all tables for a specific round (1-4)

### Scoring System

The scoring system is complex and central to the application:

1. **Base Points**: Determined by table size and position
   - 4 players: 6-4-3-2 (1st-4th)
   - 3 players: 6-4-2 (1st-3rd)
   - Ties are handled by averaging base points across tied positions

2. **Multipliers**: Applied by round
   - R1: ×1, R2: ×1, R3: ×1.25, R4: ×1.5

3. **Bonus System** (capped at +3):
   - **Hot Streak**: +1 on second consecutive win (triggers once per tournament)
   - **Arcinemico (Archenemy)**: +1/-1 when facing same opponent 3+ times (winner gets +1, loser gets -1)

4. **Tie-breakers** for standings:
   - Total points
   - SOS (Strength of Schedule - sum of opponents' total points)
   - Table wins
   - Head-to-head record

### Key Algorithms

**Promotion/Demotion** ([legalog/src/App.tsx:376-467](legalog/src/App.tsx#L376-L467)):
- After each round (except R1), top 2 players move up, bottom 2 move down
- Tie-breaking at promotion boundaries uses cumulative league points
- Automatic rebalancing to maintain 4 players per table when possible

**Game Suggestion** ([legalog/src/App.tsx:159-169](legalog/src/App.tsx#L159-L169)):
- Ensures no player plays the same game twice
- Filters out games already played by any player at the table
- Defaults to lightest weight game from available options

**Score Finalization** ([legalog/src/App.tsx:222-374](legalog/src/App.tsx#L222-L374)):
- Validates all positions are filled
- Calculates base points with tie handling
- Applies multipliers and bonuses
- Updates player stats (total, wins, games played, hot streak)
- Tracks meetings between players for Arcinemico bonus
- Generates next round's table assignments

### State Management Pattern

The app uses a "snapshot and replay" pattern:
- All game state can be exported to JSON
- Import JSON to restore exact tournament state
- Round data is immutable once finalized
- `deepClone` used extensively to prevent mutation bugs

### No-Repeat Game Constraint

Critical invariant: No player plays the same game twice in the tournament
- Enforced at game selection with visual warnings
- `suggestGameForTable` respects this constraint
- `hasRepeatGameForAny` validates before round finalization

## Development Notes

### TypeScript Usage
- Uses React with TypeScript
- Type-safe table letters with `const` assertion: `typeof TABLES[number]`
- Liberal use of Record types for key-value mappings
- Some `any` types exist for dynamic property access (e.g., `_lastWasWin`)

### Tailwind CSS
All styling uses Tailwind utility classes inline. No separate CSS files.

### Data Flow
1. Setup: Configure players and games
2. Start Tournament: Generate R1 with random seeding
3. For each round:
   - Assign games to tables
   - Record positions (supports ties)
   - Finalize round (triggers scoring + next round generation)
4. View live standings with full tie-breaker hierarchy

### Internal State Tracking
The app uses some non-standard patterns:
- `_lastWasWin` pseudo-property attached to Player objects to track consecutive wins
- `meetingsMap` maintained separately to track player encounters for Arcinemico bonus
- `hotStreakTriggered` flag prevents multiple hot streak bonuses

### Edge Cases Handled
- Tables with 3 players (different scoring)
- Tables with 5 players (warned but supported)
- Ties at promotion/demotion boundaries
- Tie-breaking when multiple players have identical records
- Insufficient players for 4 tables (warning shown)
