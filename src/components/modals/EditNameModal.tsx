import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { HiPencil } from "react-icons/hi";
import { ModernButton } from "../ui";

interface EditNameModalProps {
  isOpen: boolean;
  name: string;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({
  isOpen,
  name,
  onClose,
  onNameChange,
  onSave,
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
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all">
              <Dialog.Title className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <HiPencil className="text-indigo-600" />
                Modifica Nome Giocatore
              </Dialog.Title>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nome del giocatore
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border-2 border-indigo-300 rounded-xl font-semibold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSave();
                    }}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <ModernButton variant="success" onClick={onSave} className="flex-1">
                    Salva
                  </ModernButton>
                  <ModernButton variant="secondary" onClick={onClose} className="flex-1">
                    Annulla
                  </ModernButton>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);
