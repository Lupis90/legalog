import { motion } from "framer-motion";
import { HiCheckCircle, HiClock } from "react-icons/hi";
import { FaTrophy } from "react-icons/fa";

interface TournamentTimelineProps {
  totalRounds: number;
  currentRoundIndex: number | null;
  completedRounds: number;
}

export const TournamentTimeline: React.FC<TournamentTimelineProps> = ({
  totalRounds,
  currentRoundIndex,
  completedRounds,
}) => {
  const stages = [
    { id: "setup", label: "Setup", icon: "⚙️" },
    { id: "r1", label: "Round 1", icon: "1️⃣" },
    { id: "r2", label: "Round 2", icon: "2️⃣" },
    { id: "r3", label: "Round 3", icon: "3️⃣" },
    { id: "r4", label: "Round 4", icon: "4️⃣" },
    { id: "finish", label: "Finale", icon: "🏆" },
  ];

  const isSetup = currentRoundIndex === null || currentRoundIndex === -1;
  const isFinished = completedRounds === totalRounds;

  // Determina lo stage attuale
  let currentStageIndex = 0;
  if (isSetup) {
    currentStageIndex = 0;
  } else if (isFinished) {
    currentStageIndex = stages.length - 1;
  } else if (currentRoundIndex !== null) {
    currentStageIndex = currentRoundIndex + 1; // +1 perché setup è l'indice 0
  }

  const getStageStatus = (index: number) => {
    if (index < currentStageIndex) return "completed";
    if (index === currentStageIndex) return "active";
    return "pending";
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {/* Timeline horizontal */}
          <div className="relative flex items-center justify-between">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-slate-300 via-indigo-400 to-slate-300 transform -translate-y-1/2 z-0" />

            {/* Stage nodes */}
            <div className="relative flex items-center justify-between w-full z-10">
              {stages.map((stage, index) => {
                const status = getStageStatus(index);
                const isActive = status === "active";
                const isCompleted = status === "completed";

                return (
                  <motion.div
                    key={stage.id}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Circle node */}
                    <motion.div
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl border-4 transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-600 shadow-xl scale-110"
                          : isCompleted
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-600 shadow-lg"
                          : "bg-slate-400 border-slate-300 shadow-md"
                      }`}
                      whileHover={{
                        scale: isActive ? 1.15 : 1.05,
                      }}
                    >
                      {isCompleted ? (
                        <HiCheckCircle className="text-white text-2xl" />
                      ) : isActive ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <HiClock className="text-white text-2xl" />
                        </motion.div>
                      ) : (
                        <span className="text-white">{stage.icon}</span>
                      )}
                    </motion.div>

                    {/* Label */}
                    <div className={`mt-4 text-center text-sm font-black transition-colors duration-300 ${
                      isActive
                        ? "text-indigo-600"
                        : isCompleted
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}>
                      {stage.label}
                    </div>

                    {/* Status indicator */}
                    {isCompleted && (
                      <motion.div
                        className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        ✓ Completato
                      </motion.div>
                    )}
                    {isActive && (
                      <motion.div
                        className="mt-2 text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full"
                        animate={{ opacity: [1, 0.6, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ◆ In corso
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Progress info */}
          <div className="mt-8 flex items-center justify-center gap-4 text-sm font-semibold text-slate-700">
            <div className="px-4 py-2 bg-indigo-100 rounded-lg border-2 border-indigo-300">
              <span className="text-indigo-700">
                {completedRounds}/{totalRounds} Round completati
              </span>
            </div>
            {isSetup && (
              <div className="px-4 py-2 bg-blue-100 rounded-lg border-2 border-blue-300">
                <span className="text-blue-700">Pronto per iniziare</span>
              </div>
            )}
            {isFinished && (
              <div className="px-4 py-2 bg-emerald-100 rounded-lg border-2 border-emerald-300">
                <span className="text-emerald-700 flex items-center gap-2">
                  <FaTrophy /> Torneo concluso!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
