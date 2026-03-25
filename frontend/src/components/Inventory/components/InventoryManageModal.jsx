import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldLabels = {
  description: "Descripción",
  modelo: "Modelo",
  marca: "Marca",
  condicion: "Condición",
  estatus: "Estatus",
  cantidad: "Cantidad",
};

const renderValue = (value) => value || "—";

export const InventoryManageModal = ({
  mode,
  category,
  selectedItem,
  formData,
  selectOptions,
  onClose,
  onChangeField,
  onSave,
}) => {
  if (!mode) {
    return null;
  }

  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const title =
    mode === "create"
      ? "Agregar elemento"
      : mode === "edit"
        ? "Editar elemento"
        : "Vista rápida";

  const item = selectedItem || formData;

  const fields =
    category === "equipos"
      ? ["description", "modelo", "marca", "condicion", "estatus"]
      : ["description", "modelo", "marca", "condicion", "estatus", "cantidad"];

  const renderField = (field, value) => {
    const isSelectField = field === "condicion" || field === "estatus";
    const isNumberField = field === "cantidad";

    if (field === "description") {
      return (
        <Input
          value={value}
          type="text"
          onChange={(e) => onChangeField(field, e.target.value)}
          className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c]"
        />
      );
    }

    if (isNumberField) {
      return (
        <Input
          value={value}
          type="number"
          min="0"
          step="1"
          onChange={(e) => onChangeField(field, Number(e.target.value))}
          className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c]"
        />
      );
    }

    if (isSelectField) {
      return (
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
      );
    }

    return (
      <Input
        value={value}
        type="text"
        onChange={(e) => onChangeField(field, e.target.value)}
        className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c]"
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
              {title}
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
              {isCreateMode
                ? "Nuevo registro"
                : item?.description || "Elemento"}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 capitalize">
              {category}
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
                {item?.id ? `#${item.id}` : "Nuevo"}
              </p>
            </div>
            {category === "equipos" ? (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Estado
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  Equipo único
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Cantidad
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  {item?.cantidad ?? "—"}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
              const value =
                formData?.[field] ??
                item?.[field] ??
                (field === "cantidad" ? 0 : "");
              return (
                <div key={field} className="space-y-2">
                  <Label className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">
                    {fieldLabels[field]}
                  </Label>
                  {isViewMode ? (
                    <div className="min-h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {renderValue(value)}
                    </div>
                  ) : (
                    renderField(field, value)
                  )}
                </div>
              );
            })}
          </div>

          {isEditMode || isCreateMode ? (
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
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
              >
                {isCreateMode ? "Guardar" : "Establecer"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
