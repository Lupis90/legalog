# LegaLog - LOG League Tournament Manager

A modern web application for managing "LOG League" (Big Game- Flavour) board game tournaments with automatic scoring, promotion/demotion system, and comprehensive player statistics.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## Overview

LegaLog manages tournaments for 16 players across 4 rounds of board games on 4 tables (A-D). The application features:

- **Automatic Seeding**: Random table assignments for Round 1
- **Complex Scoring System**: Position-based points with multipliers and bonuses
- **Promotion/Demotion**: Top 2 players move up, bottom 2 move down between rounds
- **Smart Game Assignment**: Ensures no player plays the same game twice
- **Real-time Standings**: Live rankings with advanced tie-breakers
- **Data Persistence**: Auto-save to localStorage with JSON export/import
- **Modern UI**: Glassmorphism design with responsive layout

## Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd legalog

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## How to Use

### 1. Setup Phase

1. **Configure Players**: Add/edit player names (default: 16 players)
2. **Configure Games**: Add/edit game titles (default: 8 games)
3. Click **"Inizia Torneo"** to start the tournament

### 2. Round Execution

1. **Record Results**: For each table, select position (1st-4th) for each player
   - Ties are supported (e.g., two players can both place 1st)
2. **Finalize Round**: Click **"Finalizza Round"** to:
   - Calculate scores with multipliers and bonuses
   - Generate next round with promotions/demotions
   - Update standings and statistics

### 3. View Results

- **Classifica Live**: Real-time tournament standings
- **Timeline**: Visual representation of player movements across rounds
- **Storico Round**: Detailed history of all completed rounds
- **Export/Import**: Save and load tournament data as JSON

## Tournament Rules

### Table Structure

- **4 Tables** (A, B, C, D) with **4 players each**
- Table A is the "premier" table, Table D is the lowest
- After each round (except R1), players are promoted/demoted based on performance

### Scoring System

#### Base Points by Position

| Players | 1st | 2nd | 3rd | 4th | 5th |
|---------|-----|-----|-----|-----|-----|
| 3       | 6   | 4   | 2   | -   | -   |
| 4       | 6   | 4   | 3   | 2   | -   |
| 5       | 7   | 5   | 3   | 2   | 1   |

**Ties**: When players tie, base points are averaged across tied positions.

#### Round Multipliers

- **Round 1**: ×1.0
- **Round 2**: ×1.0
- **Round 3**: ×1.25
- **Round 4**: ×1.5

#### Bonus System

Bonuses are capped at **+3 per player per round**.

1. **Hot Streak** (+1 point):
   - Triggered on second consecutive win
   - Can only trigger once per tournament

2. **Arcinemico/Archenemy** (±1 point):
   - Activated when players face each other 3+ times
   - Winner gets +1, loser gets -1
   - Capped at ±1 per player per round (even with multiple archnemeses)

#### Tie-Breakers for Standings

1. Total points
2. SOS (Strength of Schedule - sum of all opponents' total points)
3. Table wins (1st place finishes)
4. Head-to-head record

### Promotion/Demotion Rules

- **Top 2 players** from each table move up one table
- **Bottom 2 players** move down one table
- Table A: no promotion (top table)
- Table D: no demotion (bottom table)
- **Tie-breaking**: At promotion boundaries, ties are broken by cumulative league points

### Game Assignment Rules

- **No-Repeat Constraint**: No player can play the same game twice
- Games are pre-assigned via `GAME_SCHEMA` in constants
- Visual warnings appear if constraint would be violated
- Smart suggestions help avoid conflicts

## Architecture

### Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Project Structure

```
src/
├── App.tsx                     # Main application component
├── main.tsx                    # React entry point
├── types/
│   └── index.ts               # TypeScript definitions
├── context/
│   └── TournamentContext.tsx  # Global state management
├── hooks/
│   └── useTournament.ts       # Tournament business logic
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── cards/                 # Domain-specific cards
│   ├── sections/              # Major page sections
│   └── modals/                # Modal dialogs
├── utils/
│   ├── scoring.ts             # Point calculation
│   ├── promotions.ts          # Promotion/demotion algorithm
│   ├── standings.ts           # Standings calculation
│   └── helpers.ts             # Utility functions
└── constants/
    └── index.ts               # Game data and configuration
```

### Key Design Patterns

- **React Context API**: Global state management with auto-save
- **Custom Hooks**: Business logic separation (useTournament)
- **Pure Functions**: Scoring and promotion algorithms
- **Immutable Data**: Rounds are immutable once finalized
- **Type Safety**: Full TypeScript coverage

## Data Models

### Player

```typescript
interface Player {
  id: number;
  name: string;
  points: number;
  pointsR1: number;
  pointsR2: number;
  pointsR3: number;
  pointsR4: number;
  gamesPlayed: string[];
  winCount: number;
  hotStreakTriggered: boolean;
}
```

### TableResult

```typescript
interface TableResult {
  table: 'A' | 'B' | 'C' | 'D';
  players: Player[];
  gameTitle: string;
  positions: number[];
}
```

### RoundData

```typescript
interface RoundData {
  roundNumber: number;
  tables: TableResult[];
}
```

## State Management

The application uses React Context with automatic persistence:

- **TournamentContext**: Provides global state and actions
- **localStorage**: Auto-saves on every change (key: `legalog-tournament`)
- **Export/Import**: Full tournament data as JSON
- **Deep Cloning**: Prevents mutation bugs in state updates

## Advanced Features

### SOS (Strength of Schedule)

Calculated as the sum of all opponents' total points across all rounds. Used as the primary tie-breaker after total points.

### Head-to-Head Record

When all other tie-breakers are equal, direct matchups between tied players are used to determine final ranking.

### Tournament Timeline

Visual representation showing:
- Player movements between tables across rounds
- Color-coded paths (green for promotions, red for demotions)
- Interactive hover effects

### Data Export/Import

- Export tournament state as JSON
- Import previously saved tournaments
- Useful for backup and sharing

## Development

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React/TypeScript
- **Tailwind CSS**: Utility-first styling
- **Component Structure**: Organized by domain and reusability

### Adding New Features

1. Define types in `src/types/index.ts`
2. Add business logic to hooks or utils
3. Create UI components in appropriate directory
4. Update context if global state changes needed
5. Test all edge cases (ties, promotions, constraints)

### Key Utilities

- `calculateRoundTotals()`: Core scoring algorithm (src/utils/scoring.ts)
- `computePromotions()`: Promotion/demotion logic (src/utils/promotions.ts)
- `calculateStandings()`: Rankings with tie-breakers (src/utils/standings.ts)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and desktop
- LocalStorage required for data persistence

## Contributing

When contributing:

1. Follow existing code patterns and architecture
2. Maintain type safety - no `any` types unless necessary
3. Test edge cases (ties, insufficient players, etc.)
4. Update this README if adding major features
5. Follow the modular architecture principles

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Developed for the LOG League board game community.

---

**Version**: 1.0.0
**Last Updated**: January 2025
