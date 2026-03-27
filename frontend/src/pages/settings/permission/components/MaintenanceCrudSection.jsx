import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Pencil, Search, X } from "lucide-react";
import { Table } from "@/components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalPortal } from "@/components/ui/modal-portal";

const maskPassword = (value = "") => "*".repeat(String(value).length || 6);

const getInputType = (key) => {
  if (key === "email") return "email";
  if (key === "password") return "password";
  if (key === "edad" || key.endsWith("_id") || key === "id") return "number";
  return "text";
};

const buildDefaultValues = (columns, defaults = {}, nextId = 1) => {
  const next = { ...defaults };

  if (next.id == null) {
    next.id = nextId;
  }

  for (const column of columns) {
    if (!(column.key in next)) {
      next[column.key] = "";
    }
  }

  return next;
};

const CrudModal = ({
  mode,
  title,
  columns,
  formData,
  isSaving,
  errorMessage,
  onClose,
  onChangeField,
  onSave,
}) => {
  if (!mode) {
    return null;
  }

  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-md">
        <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 p-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
                {isCreateMode
                  ? "Nuevo registro"
                  : isViewMode
                    ? "Detalle"
                    : "Edición"}
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
                {title}
              </h3>
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
            <div className="grid gap-4 md:grid-cols-2">
              {columns.map((column) => {
                const value = formData?.[column.key] ?? "";
                const inputType = getInputType(column.key);

                return (
                  <div key={column.key} className="space-y-2">
                    <Label className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">
                      {column.label}
                    </Label>
                    {isViewMode ? (
                      <div className="min-h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {column.key === "password"
                          ? maskPassword(value)
                          : value || "-"}
                      </div>
                    ) : (
                      <Input
                        value={value}
                        type={inputType}
                        min={inputType === "number" ? "0" : undefined}
                        onChange={(event) =>
                          onChangeField(
                            column.key,
                            inputType === "number"
                              ? Number(event.target.value || 0)
                              : event.target.value,
                          )
                        }
                        className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c]"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {!isViewMode ? (
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-6">
                {errorMessage ? (
                  <p className="mr-auto text-sm font-semibold text-red-500">
                    {errorMessage}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  {isSaving
                    ? "Guardando..."
                    : isCreateMode
                      ? "Guardar"
                      : "Actualizar"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

const DeleteModal = ({ isOpen, names, onClose, onDelete }) => {
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
                {names.map((name) => (
                  <li key={name}>{name}</li>
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

export const MaintenanceCrudSection = ({
  sectionId,
  title,
  searchPlaceholder,
  columns,
  nameKey,
  initialItems,
  defaultValues,
  onCreateItem,
}) => {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalState, setModalState] = useState({ mode: null, item: null });
  const [formData, setFormData] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const visibleColumns = columns.filter((column) => column.key !== "id");

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) => {
      const targetValue = String(item[nameKey] || "").toLowerCase();
      return targetValue.includes(normalizedSearch);
    });
  }, [items, nameKey, searchTerm]);

  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredItems.some((item) => item.id === id)),
      );
      return;
    }

    const filteredIds = filteredItems.map((item) => item.id);
    setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const openCreateModal = () => {
    const nextId =
      items.length > 0
        ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1
        : 1;

    const draft = buildDefaultValues(visibleColumns, defaultValues, nextId);

    setFormData(draft);
    setSaveError("");
    setModalState({ mode: "create", item: null });
  };

  const openModal = (mode, item) => {
    setFormData({ ...item });
    setSaveError("");
    setModalState({ mode, item });
  };

  const closeModal = () => {
    setModalState({ mode: null, item: null });
    setFormData({});
    setSaveError("");
    setIsSaving(false);
  };

  const saveModal = async () => {
    if (modalState.mode === "create") {
      try {
        setIsSaving(true);
        setSaveError("");
        const createdItem = onCreateItem
          ? await onCreateItem(formData)
          : formData;
        setItems((prev) => [...prev, createdItem || formData]);
        closeModal();
      } catch (error) {
        setSaveError(
          error?.message || "No se pudo guardar el registro en el servidor",
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (modalState.mode === "edit") {
      setItems((prev) =>
        prev.map((item) => (item.id === modalState.item.id ? formData : item)),
      );
      closeModal();
    }
  };

  const itemsToDelete = items.filter((item) => selectedIds.includes(item.id));

  const openDeleteModal = () => {
    if (itemsToDelete.length === 0) {
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSelected = () => {
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    closeDeleteModal();
  };

  return (
    <motion.section
      id={sectionId}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="scroll-mt-24 space-y-4"
    >
      <div className="relative w-full md:w-[340px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200"
        />
      </div>

      <Table
        title={title}
        headers={visibleColumns.map((column) => ({
          label: column.label,
          align: column.align || "left",
          width: column.width,
        }))}
        isAllSelected={isAllSelected}
        onSelectAll={toggleSelectAll}
        onAddClick={openCreateModal}
        onDeleteClick={openDeleteModal}
      >
        {filteredItems.map((item) => (
          <tr
            key={item.id}
            className={`hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-colors ${selectedIds.includes(item.id) ? "bg-blue-50/30 dark:bg-blue-500/5" : ""}`}
          >
            <td className="py-4 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 text-center w-20">
              #{item.id}
            </td>
            <td className="py-4 px-4 w-12">
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleRow(item.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                />
              </div>
            </td>

            {visibleColumns.map((column) => (
              <td
                key={`${item.id}-${column.key}`}
                className={`py-4 px-4 text-sm text-slate-700 dark:text-slate-300 ${column.align === "center" ? "text-center" : "text-left"}`}
              >
                {column.key === "password"
                  ? maskPassword(item[column.key])
                  : (item[column.key] ?? "-")}
              </td>
            ))}

            <td className="py-4 px-4 w-32">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => openModal("view", item)}
                  title="Ver detalle"
                  className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl cursor-pointer"
                >
                  <Eye size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => openModal("edit", item)}
                  title="Editar"
                  className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl cursor-pointer"
                >
                  <Pencil size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <CrudModal
        mode={modalState.mode}
        title={title}
        columns={visibleColumns}
        formData={formData}
        isSaving={isSaving}
        errorMessage={saveError}
        onClose={closeModal}
        onChangeField={(field, value) =>
          setFormData((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onSave={saveModal}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        names={itemsToDelete.map((item) => String(item[nameKey] || item.id))}
        onClose={closeDeleteModal}
        onDelete={handleDeleteSelected}
      />
    </motion.section>
  );
};
