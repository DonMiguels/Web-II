import { useEffect } from "react";
import { Search, X, ChevronRight, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/context";

const TransferItemCard = ({
  title,
  extraContent,
  onAction,
  actionIcon: ActionIcon,
  actionClassName,
  toneClassName,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${toneClassName}`}
    >
      <div className="min-w-0 flex-1">
        <h6 className="truncate font-bold text-slate-800 dark:text-white">
          {title}
        </h6>
        {extraContent ? <div className="mt-2">{extraContent}</div> : null}
      </div>
      <button
        type="button"
        onClick={onAction}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${actionClassName}`}
      >
        <ActionIcon size={12} />
      </button>
    </div>
  );
};

export const CreateLoanModal = ({
  isOpen,
  onClose,
  createLoanType,
  onChangeCreateLoanType,
  createSearchTerm,
  onChangeCreateSearchTerm,
  filteredCreateCatalog,
  onAddItem,
  selectedLoanItems,
  onChangeItemQuantity,
  onRemoveItem,
  selectedUser,
  loanDate,
  onChangeLoanDate,
  returnDate,
  onChangeReturnDate,
  onCreateLoan,
}) => {
  const { isExpanded } = useSidebar();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[220] bg-slate-950/60 backdrop-blur-sm">
      <div
        className={`flex h-full w-full items-center justify-center px-3 py-4 md:px-6 md:py-6 ${
          isExpanded ? "lg:pl-[292px]" : "lg:pl-[108px]"
        }`}
      >
        <div className="w-full max-w-6xl h-[94vh] overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 p-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
                Nuevo préstamo
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
                Agregar préstamo
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Selecciona equipos o insumos y completa los datos del préstamo.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl p-3 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="h-[calc(94vh-112px)] overflow-y-auto custom-scrollbar">
            <div className="grid gap-6 p-6 xl:grid-cols-2">
              <div className="space-y-4 rounded-[28px] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      Catálogo
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Filtra y mueve elementos al préstamo.
                    </p>
                  </div>

                  <div className="w-40 shrink-0">
                    <Label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Tipo
                    </Label>
                    <select
                      value={createLoanType}
                      onChange={(e) => onChangeCreateLoanType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] px-3 py-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="equipos">Equipos</option>
                      <option value="insumos">Insumos</option>
                    </select>
                  </div>
                </div>

                <div className="relative w-full">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={createSearchTerm}
                    onChange={(e) => onChangeCreateSearchTerm(e.target.value)}
                    placeholder="Buscar en catálogo..."
                    className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">
                          Disponibles
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Pulsa el botón para agregarlos.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                        {filteredCreateCatalog.length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredCreateCatalog.length > 0 ? (
                        filteredCreateCatalog.map((item) => (
                          <TransferItemCard
                            key={item.id}
                            title={item.titulo}
                            onAction={() => onAddItem(item)}
                            actionIcon={ChevronRight}
                            actionClassName="bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
                            toneClassName="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                          />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          No hay resultados para este filtro.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">
                          Seleccionados
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Elementos asignados a este préstamo.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                        {selectedLoanItems.length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                      {selectedLoanItems.length > 0 ? (
                        selectedLoanItems.map((item) => (
                          <TransferItemCard
                            key={item.id}
                            title={item.titulo}
                            extraContent={
                              (item.category || createLoanType) ===
                              "insumos" ? (
                                <div className="flex items-center gap-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Cant.
                                  </Label>
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={item.cantidad ?? 1}
                                    onChange={(e) =>
                                      onChangeItemQuantity(
                                        item.id,
                                        Math.max(
                                          1,
                                          Number(e.target.value) || 1,
                                        ),
                                      )
                                    }
                                    className="w-24 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                                  />
                                </div>
                              ) : null
                            }
                            onAction={() => onRemoveItem(item.id)}
                            actionIcon={X}
                            actionClassName="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                            toneClassName="border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5"
                          />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          Aún no hay elementos agregados.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
                <div>
                  <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    Datos del préstamo
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verifica el usuario, las fechas y confirma la asignación.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                  <Label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Usuario asignado
                  </Label>

                  {selectedUser ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        value={selectedUser.name}
                        readOnly
                        className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                      />
                      <Input
                        value={selectedUser.profile}
                        readOnly
                        className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                      />
                      <Input
                        value={selectedUser.group}
                        readOnly
                        className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
                      Busca primero al usuario para poder asignar el préstamo.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Elementos seleccionados
                    </Label>
                    <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                      {selectedLoanItems.length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedLoanItems.length > 0 ? (
                      selectedLoanItems.map((item) => (
                        <div
                          key={`summary-${item.id}`}
                          className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between gap-3"
                        >
                          <span className="truncate">{item.titulo}</span>
                          <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 shrink-0">
                            {(item.category || createLoanType) === "equipos"
                              ? "Equipo"
                              : "Insumo"}
                          </span>
                          {(item.category || createLoanType) === "insumos" ? (
                            <span className="rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 shrink-0">
                              Cant. {item.cantidad ?? 1}
                            </span>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-5 text-sm text-slate-500 dark:text-slate-400">
                        No hay elementos seleccionados aún.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <CalendarDays size={14} /> Fecha de préstamo
                    </Label>
                    <Input
                      type="date"
                      value={loanDate}
                      onChange={(e) => onChangeLoanDate(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                    />
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <CalendarDays size={14} /> Fecha de devolución
                    </Label>
                    <Input
                      type="date"
                      value={returnDate}
                      onChange={(e) => onChangeReturnDate(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCreateLoan}
                  disabled={!selectedUser || selectedLoanItems.length === 0}
                  className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
