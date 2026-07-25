import { useState } from "react";
import { Search, Monitor, Package } from "lucide-react";
import { Table } from "../Table/Table.jsx";
import { ItemTable } from "../ItemTable/ItemTable.jsx";
import { useInventoryData } from "./hooks/useInventoryData.js";
import { useInventorySelection } from "./hooks/useInventorySelection.js";
import { InventoryManageModal } from "./components/InventoryManageModal.jsx";
import { InventoryDeleteModal } from "./components/InventoryDeleteModal.jsx";

const defaultCreateForm = (category) => ({
  description: "",
  modelo: "",
  marca: "",
  condicion: category === "equipos" ? "Bueno" : "Nuevo",
  estatus: category === "equipos" ? "Disponible" : "Stock",
  ...(category === "componentes" ? { cantidad: 1 } : {}),
});

/**
 * Vista principal de inventario de laboratorio (equipos y componentes).
 *
 * @returns {JSX.Element} Módulo de inventario.
 */
export const Inventory = () => {
  const {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    currentData,
    filteredData,
    handleCreateItem,
    handleSetChanges,
    handleDeleteItems,
  } = useInventoryData();

  const { selectedIds, handleSelectRow, handleSelectAll, clearSelection } =
    useInventorySelection(filteredData);

  const [modalState, setModalState] = useState({ mode: null, category: null });
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(defaultCreateForm(activeCategory));
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchTerm("");
    clearSelection();
    setModalState({ mode: null, category: null });
    setSelectedItem(null);
    setFormData(defaultCreateForm(category));
  };

  const openCreateModal = () => {
    setModalState({ mode: "create", category: activeCategory });
    setSelectedItem(null);
    setFormData(defaultCreateForm(activeCategory));
  };

  const openModal = (mode, item) => {
    setModalState({ mode, category: activeCategory });
    setSelectedItem(item);
    setFormData({ ...item });
  };

  const closeModal = () => {
    setModalState({ mode: null, category: null });
    setSelectedItem(null);
    setFormData(defaultCreateForm(activeCategory));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getSelectOptions = (category) =>
    category === "equipos"
      ? {
          condicion: ["Bueno", "Dañado"],
          estatus: ["Disponible", "Mantenimiento", "Ocupado"],
        }
      : {
          condicion: ["Nuevo", "Bueno", "Usado", "Dañado"],
          estatus: ["Stock", "Disponible", "Asignado", "Agotado"],
        };

  const handleSave = () => {
    if (modalState.mode === "create") {
      handleCreateItem({ category: modalState.category, formData });
      closeModal();
      return;
    }

    handleSetChanges({
      category: modalState.category,
      selectedItem,
      formData,
    });
    closeModal();
  };

  const openDeleteModal = () => {
    if (selectedIds.length === 0) {
      return;
    }

    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteSelected = () => {
    handleDeleteItems(selectedIds, activeCategory);
    clearSelection();
    closeDeleteModal();
  };

  const itemsToDelete = currentData.filter((item) =>
    selectedIds.includes(item.id),
  );

  const displayCategory = activeCategory === "equipos" ? "equipos" : "insumos";

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-md p-4 rounded-[20px] border border-slate-200 dark:border-white/5">
        <div className="flex gap-2 bg-slate-100 dark:bg-black/20 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
          <button
            onClick={() => handleCategoryChange("equipos")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeCategory === "equipos"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Monitor size={18} /> Equipos
          </button>
          <button
            onClick={() => handleCategoryChange("componentes")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeCategory === "componentes"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Package size={18} /> Insumos
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Buscar ${displayCategory}...`}
            className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      <Table
        title={`Inventario de ${activeCategory === "equipos" ? "Equipos" : "Insumos"}`}
        headers={
          activeCategory === "equipos"
            ? [
                { label: "Descripción", align: "left" },
                { label: "Modelo", align: "center" },
                { label: "Marca", align: "center" },
                { label: "Condición", align: "center" },
                { label: "Estatus", align: "center" },
              ]
            : [
                { label: "Descripción", align: "left" },
                { label: "Modelo", align: "center" },
                { label: "Marca", align: "center" },
                { label: "Condición", align: "center" },
                { label: "Estatus", align: "center" },
                { label: "Cant.", align: "center" },
              ]
        }
        isAllSelected={
          filteredData.length > 0 &&
          filteredData.every((item) => selectedIds.includes(item.id))
        }
        onSelectAll={handleSelectAll}
        onAddClick={openCreateModal}
        onDeleteClick={openDeleteModal}
      >
        {filteredData.map((item) => (
          <ItemTable
            key={item.id}
            item={item}
            category={activeCategory}
            selected={selectedIds.includes(item.id)}
            onSelect={handleSelectRow}
            onView={(currentItem) => openModal("view", currentItem)}
            onEdit={(currentItem) => openModal("edit", currentItem)}
          />
        ))}
      </Table>

      <InventoryManageModal
        mode={modalState.mode}
        category={modalState.category}
        selectedItem={selectedItem}
        formData={formData}
        selectOptions={getSelectOptions(modalState.category || activeCategory)}
        onClose={closeModal}
        onChangeField={handleChange}
        onSave={handleSave}
      />

      <InventoryDeleteModal
        isOpen={isDeleteModalOpen}
        itemsToDelete={itemsToDelete}
        onClose={closeDeleteModal}
        onDelete={handleDeleteSelected}
      />
    </div>
  );
};
