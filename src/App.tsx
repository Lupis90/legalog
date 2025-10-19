import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { TournamentProvider, useTournamentContext } from "./context/TournamentContext";
import { useTournament } from "./hooks/useTournament";
import { Header, PlayersSection, GamesSection, CurrentRound, StandingsTable, Footer } from "./components/sections";
import { EditNameModal, ExportModal } from "./components/modals";
import type { TableLetter } from "./types";

/**
 * LOG League – Dashboard (Big-Game Flavor)
 * Refactored modular architecture
 */

function AppContent() {
  const {
    players,
    games,
    rounds,
    currentRound,
    playerMap,
    standings,
    addPlayer,
    removeLastPlayer,
    updatePlayerName,
    updateGame,
    removeGame,
    addGame,
    updatePosition,
    setGameForTable,
    exportData,
    importData,
  } = useTournamentContext();

  const { startTournament, finalizeRound, suggestGameForTable, hasRepeatGameForAny } =
    useTournament();

  const [jsonIO, setJsonIO] = useState<string>("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<{ id: string; name: string } | null>(null);

  function handleExportJSON() {
    const data = exportData();
    setJsonIO(JSON.stringify(data, null, 2));
    setShowExportModal(true);
    toast.success("JSON generato!");
  }

  function handleImportJSON() {
    try {
      const data = JSON.parse(jsonIO);
      if (!data.players || !data.rounds) throw new Error("JSON non valido");
      importData(data);
      toast.success("✅ Dati importati con successo!");
    } catch (e: any) {
      toast.error("❌ Errore import JSON: " + e.message);
    }
  }

  function openEditPlayerModal(playerId: string) {
    const player = players.find((p) => p.id === playerId);
    if (player) {
      setEditingPlayer({ id: player.id, name: player.name });
      setShowEditNameModal(true);
    }
  }

  function savePlayerName() {
    if (!editingPlayer) return;
    updatePlayerName(editingPlayer.id, editingPlayer.name);
    setShowEditNameModal(false);
    setEditingPlayer(null);
    toast.success("Nome aggiornato!");
  }

  function handleSuggestGame(roundIndex: number, table: TableLetter, playerIds: string[]) {
    const suggested = suggestGameForTable(playerIds);
    if (suggested) {
      setGameForTable(roundIndex, table, suggested);
    }
  }

  function handleAddPlayer() {
    addPlayer();
    toast.success("Giocatore aggiunto!");
  }

  function handleRemovePlayer() {
    if (players.length > 0) {
      removeLastPlayer();
      toast.success("Giocatore rimosso!");
    }
  }

  const currentRoundIndex = currentRound ? rounds.indexOf(currentRound) : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#1e293b",
            fontWeight: 600,
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          },
        }}
      />

      <div className="relative max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <Header onStartTournament={startTournament} onExport={handleExportJSON} />

        {/* Setup Section */}
        <section className="grid md:grid-cols-2 gap-8 mb-12">
          <PlayersSection
            players={players}
            onAdd={handleAddPlayer}
            onRemove={handleRemovePlayer}
            onNameChange={(id, name) => updatePlayerName(id, name)}
          />
          <GamesSection
            games={games}
            onUpdate={updateGame}
            onRemove={removeGame}
            onAdd={addGame}
          />
        </section>

        {/* Current Round */}
        {currentRound && currentRoundIndex >= 0 && (
          <CurrentRound
            round={currentRound}
            playerMap={playerMap}
            games={games}
            roundIndex={currentRoundIndex}
            hasRepeatGameForAny={hasRepeatGameForAny}
            onGameChange={setGameForTable}
            onPositionChange={updatePosition}
            onSuggestGame={handleSuggestGame}
            onFinalize={finalizeRound}
          />
        )}

        {/* Standings */}
        <StandingsTable standings={standings} onEditName={openEditPlayerModal} />

        {/* Footer */}
        <Footer />
      </div>

      {/* Modals */}
      <EditNameModal
        isOpen={showEditNameModal}
        name={editingPlayer?.name || ""}
        onClose={() => setShowEditNameModal(false)}
        onNameChange={(name) => setEditingPlayer(editingPlayer ? { ...editingPlayer, name } : null)}
        onSave={savePlayerName}
      />

      <ExportModal
        isOpen={showExportModal}
        jsonData={jsonIO}
        onClose={() => setShowExportModal(false)}
        onJsonChange={setJsonIO}
        onExport={handleExportJSON}
        onImport={handleImportJSON}
      />
    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}
