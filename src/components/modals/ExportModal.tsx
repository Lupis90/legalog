import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { HiDownload, HiUpload, HiClipboard, HiSparkles } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { ModernButton } from "../ui";

interface ExportModalProps {
  isOpen: boolean;
  jsonData: string;
  onClose: () => void;
  onJsonChange: (json: string) => void;
  onExport: () => void;
  onImport: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  jsonData,
  onClose,
  onJsonChange,
  onExport,
  onImport,
}) => (
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
            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all">
              <Dialog.Title className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <HiDownload className="text-indigo-600" />
                Esporta / Importa Dati
              </Dialog.Title>

              <div className="space-y-6">
                <div className="flex gap-3">
                  <ModernButton variant="primary" onClick={onExport} icon={<HiDownload />}>
                    Aggiorna JSON
                  </ModernButton>
                  <ModernButton variant="success" onClick={onImport} icon={<HiUpload />}>
                    Importa JSON
                  </ModernButton>
                  <ModernButton
                    variant="secondary"
                    onClick={() => {
                      if (jsonData) {
                        navigator.clipboard.writeText(jsonData);
                        toast.success("📋 JSON copiato!");
                      }
                    }}
                    icon={<HiClipboard />}
                  >
                    Copia
                  </ModernButton>
                </div>

                <div className="relative">
                  <textarea
                    className="w-full h-96 bg-slate-900 text-green-400 border-4 border-indigo-500 rounded-2xl p-6 font-mono text-sm leading-relaxed focus:border-purple-500 focus:ring-4 focus:ring-purple-300 transition-all"
                    value={jsonData}
                    onChange={(e) => onJsonChange(e.target.value)}
                    placeholder='{"players": [...], "rounds": [...], "games": [...]}'
                  />
                  <div className="absolute top-4 right-4 px-3 py-2 bg-slate-700/90 backdrop-blur-sm rounded-xl text-sm text-green-400 font-mono font-bold">
                    JSON
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-blue-100 rounded-2xl border-2 border-blue-300">
                  <HiSparkles className="text-3xl text-blue-600 flex-shrink-0" />
                  <div className="text-sm text-blue-800 font-semibold">
                    <p className="font-black mb-2 text-lg">Come salvare:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Clicca "Aggiorna JSON" per generare il salvataggio</li>
                      <li>Copia il testo o salvalo in un file</li>
                      <li>Per ripristinare: incolla il JSON e clicca "Importa JSON"</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <ModernButton variant="secondary" onClick={onClose}>
                  Chiudi
                </ModernButton>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);
