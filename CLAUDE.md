# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LegaLog is a React/TypeScript application for managing a board game tournament league called "LOG League" (Big-Game Flavor). The app tracks 16 players across 4 rounds of games on 4 tables (A-D) with promotions/demotions between rounds.

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

### Modular Architecture
The application has been refactored from a single-file app into a modular architecture with separation of concerns:

- **App.tsx**: Main application entry point and UI orchestration
- **Context**: React Context for global state management
- **Hooks**: Custom hooks for business logic
- **Components**: Organized into UI primitives, cards, sections, and modals
- **Utils**: Pure utility functions for scoring, promotions, standings
- **Constants**: Configuration and game data
- **Types**: TypeScript type definitions

### File Structure

```
src/
├── App.tsx                     # Main app component
├── main.tsx                    # React entry point
├── types/
│   └── index.ts               # TypeScript type definitions
├── context/
│   └── TournamentContext.tsx  # Global state management
├── hooks/
│   └── useTournament.ts       # Tournament business logic
├── components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── GlassCard.tsx
│   │   └── ModernButton.tsx
│   ├── cards/                 # Domain-specific cards
│   │   ├── GameCard.tsx
│   │   ├── PlayerCard.tsx
│   │   └── TableCard.tsx
│   ├── sections/              # Major page sections
│   │   ├── Header.tsx
│   │   ├── PlayersSection.tsx
│   │   ├── GamesSection.tsx
│   │   ├── CurrentRound.tsx
│   │   ├── StandingsTable.tsx
│   │   ├── TournamentTimeline.tsx
│   │   ├── RoundsHistory.tsx
│   │   └── Footer.tsx
│   └── modals/                # Modal dialogs
│       ├── EditNameModal.tsx
│       └── ExportModal.tsx
├── utils/
│   ├── scoring.ts             # Point calculation logic
│   ├── promotions.ts          # Promotion/demotion algorithm
│   ├── standings.ts           # Standings calculation
│   └── helpers.ts             # Generic utilities
└── constants/
    └── index.ts               # Game data, schemas, config
```

### Core Data Structures (src/types/index.ts)

- **Player**: Tracks individual player state including:
  - Points (total and per-round breakdown)
  - Games played (enforces no-repeat rule)
  - Win count and hot streak status

- **TableResult**: Represents a single table in a round with:
  - Assigned players (typically 4, supports 3-5)
  - Game title
  - Position placements (supports ties)

- **RoundData**: Contains all tables for a specific round (1-4)

- **StandingRow**: Calculated standings with tie-breakers

### Scoring System

The scoring system is complex and central to the application:

1. **Base Points**: Determined by table size and position
   - 4 players: 6-4-3-2 (1st-4th)
   - 3 players: 6-4-2 (1st-3rd)
   - Ties are handled by averaging base points across tied positions

2. **Multipliers**: Applied by round
   - R1: ×1, R2: ×1, R3: ×1.25, R4: ×1.5

3. **Bonus System** (individual bonuses capped, total capped at +3):
   - **Hot Streak**: +1 on second consecutive win (triggers once per tournament)
   - **Arcinemico (Archenemy)**: Max ±1 per player per round when facing same opponent 3+ times (winner gets +1, loser gets -1). If a player faces multiple archnemeses in the same round, the bonus is capped at ±1 total for that round.

4. **Tie-breakers** for standings:
   - Total points
   - SOS (Strength of Schedule - sum of opponents' total points)
   - Table wins
   - Head-to-head record

### Key Modules

**Context: TournamentContext.tsx** (src/context/TournamentContext.tsx):
- Manages global state using React Context API
- Handles players, games, rounds, meetingsMap
- Provides actions for updating state (addPlayer, updatePosition, etc.)
- Implements auto-save to localStorage
- Exports/imports tournament data as JSON

**Hook: useTournament.ts** (src/hooks/useTournament.ts):
- Contains tournament business logic
- `startTournament()`: Initializes R1 with random seeding
- `finalizeRound()`: Validates positions, calculates scores, generates next round
- `suggestGameForTable()`: Suggests games respecting no-repeat constraint
- `hasRepeatGameForAny()`: Validates no player plays same game twice

**Utilities**:

- **scoring.ts** (src/utils/scoring.ts):
  - `calculateBasePoints()`: Computes base points with tie handling
  - `calculateWinners()`: Identifies 1st place players
  - `calculateBonuses()`: Calculates Hot Streak + Arcinemico bonuses (with per-round caps)
  - `calculateRoundTotals()`: Applies multipliers and caps bonuses at +3
  - `updateMeetings()`: Tracks player encounters for Arcinemico

- **promotions.ts** (src/utils/promotions.ts):
  - `computePromotions()`: Handles promotion/demotion logic
  - Top 2 players move up, bottom 2 move down (after R1)
  - Tie-breaking at promotion boundaries uses cumulative league points
  - Automatic rebalancing to maintain 4 players per table

- **standings.ts** (src/utils/standings.ts):
  - `calculateStandings()`: Computes full standings with tie-breakers
  - Tie-breakers: Total points → SOS → Wins → Head-to-head

### State Management Pattern

The app uses React Context with automatic persistence:
- **TournamentContext** provides global state and actions
- **localStorage** auto-saves state on every change (key: `legalog-tournament`)
- All game state can be exported/imported as JSON
- Round data is immutable once finalized
- `deepClone` (from utils/helpers.ts) used to prevent mutation bugs

### No-Repeat Game Constraint

Critical invariant: No player plays the same game twice in the tournament
- **Fixed Game Schema**: Games are pre-assigned per round via `GAME_SCHEMA` (constants/index.ts)
- Visual warnings shown in UI if constraint would be violated
- `suggestGameForTable` (useTournament.ts) respects this constraint
- `hasRepeatGameForAny` (useTournament.ts) validates before round finalization

## Development Notes

### TypeScript Usage
- Full TypeScript throughout the codebase
- All types defined in `src/types/index.ts`
- Type-safe table letters with `const` assertion: `typeof TABLES[number]`
- Liberal use of Record types for key-value mappings
- Some `any` types exist for dynamic property access (e.g., `_lastWasWin`)

### Styling
- **Tailwind CSS**: All styling uses Tailwind utility classes
- **react-hot-toast**: Toast notifications for user feedback
- **Glassmorphism design**: Semi-transparent cards with backdrop blur
- **Responsive layout**: Works on mobile and desktop

### Data Flow
1. **Setup Phase**:
   - Configure players (default 16) in PlayersSection
   - Configure games (default 8) in GamesSection
2. **Tournament Start**:
   - Click "Inizia Torneo" (useTournament.startTournament)
   - R1 generated with random seeding
   - Games auto-assigned from GAME_SCHEMA
3. **Round Execution**:
   - Record positions in CurrentRound component (supports ties)
   - Click "Finalizza Round" (useTournament.finalizeRound)
   - Scoring logic runs (utils/scoring.ts)
   - Next round generated with promotions/demotions (utils/promotions.ts)
4. **Live Standings**:
   - StandingsTable shows real-time rankings
   - Full tie-breaker hierarchy applied
   - SOS, wins, head-to-head calculated

### Internal State Tracking
The app uses some non-standard patterns:
- `_lastWasWin` pseudo-property attached to Player objects to track consecutive wins for Hot Streak
- `meetingsMap` (Record<string, number>) maintained in context to track player encounters for Arcinemico bonus
- Meeting keys generated via `keyPair()` helper (alphabetically sorted pair)
- `hotStreakTriggered` flag prevents multiple hot streak bonuses per tournament

### Edge Cases Handled
- Tables with 3 players (different scoring: 6-4-2)
- Tables with 5 players (warned but supported: 7-5-3-2-1)
- Ties at promotion/demotion boundaries (tie-broken by cumulative points)
- Tie-breaking when multiple players have identical records (SOS → Wins → H2H)
- Multiple archnemeses in same round (bonus capped at ±1 per player per round)
- Insufficient players for 4 tables (warning shown)

## Recent Changes

### Arcinemico Bonus Cap (2025)
The Arcinemico bonus logic was updated to enforce a strict per-round cap:
- **Old behavior**: If a player faced 2+ archnemeses in one round and won, they could receive +2 or more
- **New behavior**: Arcinemico bonus is capped at ±1 per player per round, regardless of how many archnemeses are at the table
- **Implementation**: `archnemicoApplied` tracker in `calculateBonuses()` (src/utils/scoring.ts:97)

### Modular Refactoring
The app was refactored from a single 1000+ line App.tsx into a modular architecture:
- State management extracted to TournamentContext
- Business logic moved to useTournament hook
- Scoring algorithms isolated in utils/scoring.ts
- Promotion logic in utils/promotions.ts
- UI components organized into ui/cards/sections/modals hierarchy
