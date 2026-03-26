import { ModalPortal } from "@/components/ui/modal-portal";

export const InventoryDeleteModal = ({
  isOpen,
  itemsToDelete,
  onClose,
  onDelete,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-md">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] shadow-2xl">
          <div className="border-b border-slate-100 dark:border-white/5 p-6">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              Se eliminará lo siguiente...
            </h3>
          </div>

          <div className="p-6">
            <div className="max-h-52 overflow-y-auto">
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-200">
                {itemsToDelete.map((item) => (
                  <li key={item.id}>{item.description}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-blue-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
