import React, { useState } from "react";
import { useTournamentContext } from "../context/TournamentContext";
import type { ScoringConfig } from "../types";

interface TournamentConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TournamentConfigModal({ isOpen, onClose }: TournamentConfigModalProps) {
    const { scoringConfig, setScoringConfig } = useTournamentContext();
    const [formData, setFormData] = useState<ScoringConfig>(scoringConfig);

    // Update local state when modal opens or config changes externally
    React.useEffect(() => {
        if (isOpen) {
            setFormData(scoringConfig);
        }
    }, [isOpen, scoringConfig]);

    if (!isOpen) return null;

    const handleChange = (
        section: keyof ScoringConfig,
        key: string,
        value: string
    ) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: numValue,
            },
        }));
    };

    const handleSave = () => {
        setScoringConfig(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Configurazione Torneo
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Base Points */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            Punti Base (Tavolo da 4)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((pos) => (
                                <div key={pos}>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {pos}° Posto
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={formData.basePoints[pos as 1 | 2 | 3 | 4]}
                                        onChange={(e) =>
                                            handleChange("basePoints", pos.toString(), e.target.value)
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Multipliers */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            Moltiplicatori Round
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((round) => (
                                <div key={round}>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Round {round}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        value={formData.multipliers[round as 1 | 2 | 3 | 4]}
                                        onChange={(e) =>
                                            handleChange("multipliers", round.toString(), e.target.value)
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Bonuses */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            Bonus
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Hot Streak
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.bonuses.hotStreak}
                                    onChange={(e) =>
                                        handleChange("bonuses", "hotStreak", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Arcinemico
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.bonuses.arcinemico}
                                    onChange={(e) =>
                                        handleChange("bonuses", "arcinemico", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Max Bonus
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    value={formData.bonuses.maxBonus}
                                    onChange={(e) =>
                                        handleChange("bonuses", "maxBonus", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Annulla
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors"
                    >
                        Salva Modifiche
                    </button>
                </div>
            </div>
        </div>
    );
}
