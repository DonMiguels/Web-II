import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalPortal } from "@/components/ui/modal-portal";

const fieldLabels = {
  descripcion: "Descripción",
  tipo: "Tipo",
  unidad: "Unidad",
  cantidad: "Cantidad",
  condicion: "Condición",
  estatus: "Estatus",
  fechaPrestamo: "Fecha de préstamo",
  fechaDevolucion: "Fecha de devolución",
};

const renderValue = (value) => value || "—";

/**
 * Modal para ver o editar un préstamo existente.
 *
 * @param {Object} props - Props del componente.
 * @param {"view"|"edit"|string|null} props.mode - Modo del modal.
 * @param {Object|null} props.selectedItem - Préstamo seleccionado.
 * @param {string} props.category - Categoría del ítem.
 * @param {Object} props.formData - Datos del formulario.
 * @param {Object} props.selectOptions - Opciones de selects (condición, estatus, etc.).
 * @param {Function} props.onClose - Cierra el modal.
 * @param {Function} props.onChangeField - Actualiza un campo del formulario.
 * @param {Function} props.onSave - Guarda los cambios.
 * @returns {JSX.Element|null} Modal de gestión.
 */
export const ManageLoanModal = ({
  mode,
  selectedItem,
  category,
  formData,
  selectOptions,
  onClose,
  onChangeField,
  onSave,
}) => {
  if (!mode || !selectedItem) {
    return null;
  }

  const editableFields =
    category === "insumos"
      ? [
          "descripcion",
          "tipo",
          "unidad",
          "cantidad",
          "condicion",
          "estatus",
          "fechaPrestamo",
          "fechaDevolucion",
        ]
      : [
          "descripcion",
          "tipo",
          "condicion",
          "estatus",
          "fechaPrestamo",
          "fechaDevolucion",
        ];

  const renderModalFields = (item, editable = false) => (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(fieldLabels)
        .filter(([field]) => editableFields.includes(field))
        .map(([field, label]) => {
          const isDateField =
            field === "fechaPrestamo" || field === "fechaDevolucion";
          const value = editable ? (formData?.[field] ?? "") : item?.[field];

          return (
            <div key={field} className="space-y-2">
              <Label className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">
                {label}
              </Label>
              {editable ? (
                field === "descripcion" ? (
                  <Input
                    value={value}
                    type="text"
                    onChange={(e) => onChangeField(field, e.target.value)}
                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c]"
                  />
                ) : field === "cantidad" ? (
                  <Input
                    value={value}
                    type="number"
                    min="0"
                    step="1"
                    onChange={(e) =>
                      onChangeField(field, Number(e.target.value))
                    }
                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c]"
                  />
                ) : isDateField ? (
                  <Input
                    value={value}
                    type="date"
                    onChange={(e) => onChangeField(field, e.target.value)}
                    className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c]"
                  />
                ) : (
                  <select
                    value={value}
                    onChange={(e) => onChangeField(field, e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] px-4 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {(selectOptions?.[field] || []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                <div className="min-h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {renderValue(value)}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-md">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 p-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
                {mode === "view" ? "Vista rápida" : "Edición"}
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
                {selectedItem.descripcion}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedItem.tipo}
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

          <div className="space-y-6 p-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Categoría
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
                  {category}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  ID
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  #{selectedItem.id}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Estatus
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  {selectedItem.estatus}
                </p>
              </div>
            </div>

            {mode === "view"
              ? renderModalFields(selectedItem, false)
              : renderModalFields(selectedItem, true)}

            {mode === "edit" ? (
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
                >
                  Establecer
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
