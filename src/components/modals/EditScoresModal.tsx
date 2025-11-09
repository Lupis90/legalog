import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { HiCheck, HiX } from "react-icons/hi";
import { FaCalculator } from "react-icons/fa";
import { ModernButton } from "../ui";
import type { Player } from "../../types";

interface EditScoresModalProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
  onSave: (playerId: string, adjustments: Record<number, number>) => void;
}

export const EditScoresModal: React.FC<EditScoresModalProps> = ({
  isOpen,
  player,
  onClose,
  onSave,
}) => {
  const [adjustments, setAdjustments] = useState<Record<number, number>>({});

  // Initialize adjustments from player data when modal opens
  useEffect(() => {
    if (player) {
      setAdjustments(player.manualAdjustments || {});
    }
  }, [player]);

  if (!player) return null;

  const handleAdjustmentChange = (roundIndex: number, value: string) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setAdjustments((prev) => ({
        ...prev,
        [roundIndex]: numValue,
      }));
    }
  };

  const handleSave = () => {
    // Filter out zero adjustments to keep data clean
    const cleanedAdjustments = Object.fromEntries(
      Object.entries(adjustments).filter(([_, val]) => val !== 0)
    );
    onSave(player.id, cleanedAdjustments);
    onClose();
  };

  const handleReset = (roundIndex: number) => {
    setAdjustments((prev) => {
      const next = { ...prev };
      delete next[roundIndex];
      return next;
    });
  };

  const totalAdjustment = Object.values(adjustments).reduce((sum, val) => sum + val, 0);

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all">
                <Dialog.Title className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                    <FaCalculator className="text-white text-2xl" />
                  </div>
                  Modifica Punteggi
                </Dialog.Title>

                <p className="text-slate-600 font-semibold mb-6">
                  Giocatore: <span className="text-indigo-600 font-black">{player.name}</span>
                </p>

                {/* Current Total */}
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-700">Punteggio Totale Attuale:</span>
                    <span className="text-2xl font-black text-indigo-600">
                      {player.total.toFixed(2)}
                    </span>
                  </div>
                  {totalAdjustment !== 0 && (
                    <div className="mt-2 pt-2 border-t border-indigo-300 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">Nuovo Totale:</span>
                      <span className={`text-xl font-black ${totalAdjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(player.total + totalAdjustment).toFixed(2)}
                        <span className="ml-2 text-sm">
                          ({totalAdjustment > 0 ? '+' : ''}{totalAdjustment.toFixed(2)})
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Rounds list */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {player.roundPoints.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-semibold">
                      Nessun round completato per questo giocatore
                    </div>
                  ) : (
                    player.roundPoints.map((baseScore, index) => {
                      const roundIndex = index;
                      const adjustment = adjustments[roundIndex] || 0;
                      const finalScore = baseScore + adjustment;

                      return (
                        <div
                          key={roundIndex}
                          className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-black">
                                R{roundIndex + 1}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-600">
                                  Round {roundIndex + 1}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Punteggio base: <span className="font-bold">{baseScore.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500 font-semibold mb-1">Punteggio finale</div>
                              <div className={`text-xl font-black ${adjustment !== 0 ? 'text-indigo-600' : 'text-slate-700'}`}>
                                {finalScore.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-600 mb-1">
                                Aggiustamento manuale
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  className="flex-1 px-3 py-2 bg-white border-2 border-slate-300 rounded-lg font-semibold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                  value={adjustment === 0 ? "" : adjustment}
                                  onChange={(e) => handleAdjustmentChange(roundIndex, e.target.value)}
                                  placeholder="0.00"
                                />
                                {adjustment !== 0 && (
                                  <button
                                    onClick={() => handleReset(roundIndex)}
                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                    title="Resetta"
                                  >
                                    <HiX className="text-lg" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {adjustment !== 0 && (
                              <div className="text-center px-3 py-2 bg-indigo-100 rounded-lg">
                                <div className="text-xs font-semibold text-indigo-600">Diff</div>
                                <div className={`text-sm font-black ${adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {adjustment > 0 ? '+' : ''}{adjustment.toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <ModernButton variant="success" onClick={handleSave} className="flex-1 flex items-center justify-center gap-2">
                    <HiCheck className="text-xl" />
                    Salva Modifiche
                  </ModernButton>
                  <ModernButton variant="secondary" onClick={onClose} className="flex-1">
                    Annulla
                  </ModernButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
