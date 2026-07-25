import { useState } from "react";
import { useLoansData } from "./hooks/useLoansData.js";
import { useLoanSelection } from "./hooks/useLoanSelection.js";
import { useCreateLoan } from "./hooks/useCreateLoan.js";
import { UserSearchHeader } from "./components/UserSearchHeader.jsx";
import { CategoryToolbar } from "./components/CategoryToolbar.jsx";
import { LoansTable } from "./components/LoansTable.jsx";
import { CreateLoanModal } from "./components/CreateLoanModal.jsx";
import { DeleteLoanModal } from "./components/DeleteLoanModal.jsx";
import { ManageLoanModal } from "./components/ManageLoanModal.jsx";

/**
 * Vista principal de control de préstamos: búsqueda de usuario, tabla y modales.
 *
 * @returns {JSX.Element} Módulo de préstamos.
 */
export const Loan = () => {
  const {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    currentData,
    filteredData,
    handleSetChanges,
    handleDeleteLoans,
    setEquiposData,
    setInsumosData,
  } = useLoansData();

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { selectedIds, handleSelectRow, handleSelectAll, clearSelection } =
    useLoanSelection(filteredData);

  const {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createLoanType,
    setCreateLoanType,
    createSearchTerm,
    setCreateSearchTerm,
    selectedLoanItems,
    loanDate,
    setLoanDate,
    returnDate,
    setReturnDate,
    filteredCreateCatalog,
    addItemToLoan,
    updateItemQuantity,
    removeItemFromLoan,
    handleCreateLoan,
  } = useCreateLoan({
    selectedUser,
    setEquiposData,
    setInsumosData,
  });
  const [modalState, setModalState] = useState({ mode: null, category: null });
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleUserSearch = (e) => {
    if (e.key !== "Enter" || !userSearchTerm.trim()) {
      return;
    }

    setIsSearchingUser(false);
    setSelectedUser(null);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    clearSelection();
  };

  const openModal = (mode, item) => {
    setModalState({ mode, category: activeCategory });
    setSelectedItem(item);
    setFormData({ ...item });
  };

  const closeModal = () => {
    setModalState({ mode: null, category: null });
    setSelectedItem(null);
    setFormData(null);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateLoanTypeChange = (type) => {
    setCreateLoanType(type);
    setCreateSearchTerm("");
  };

  const handleSetLoanChanges = () => {
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

  const handleDeleteSelectedLoans = () => {
    handleDeleteLoans(selectedIds);
    clearSelection();
    closeDeleteModal();
  };

  const getUniqueValues = (field) =>
    [...new Set(currentData.map((item) => item[field]).filter(Boolean))].sort();

  const getSelectOptions = (category) =>
    category === "insumos"
      ? {
          tipo: [
            "Resistencia",
            "Capacitor",
            "Diodo",
            "LED",
            "Transistor",
            "Circuito integrado",
            "Cable jumper",
            "Conector",
            "Sensor",
            "Protoboard",
          ],
          unidad: ["Pieza", "Paquete", "Set", "Rollo", "Metro", "Kit"],
          condicion: ["Bien", "Dañado"],
          estatus: getUniqueValues("estatus"),
        }
      : {
          tipo: [
            "Osciloscopio",
            "Multímetro",
            "Fuente de alimentación",
            "Generador de señales",
            "Analizador lógico",
            "Soldador",
            "Estación de retrabajo",
            "Protoboard",
            "Microscopio",
            "Kit de desarrollo",
          ],
          condicion: ["Bien", "Dañado"],
          estatus: getUniqueValues("estatus"),
        };

  const selectOptions = getSelectOptions(modalState.category || activeCategory);

  const itemsToDelete = currentData.filter((item) =>
    selectedIds.includes(item.id),
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <UserSearchHeader
        userSearchTerm={userSearchTerm}
        onUserSearchTermChange={setUserSearchTerm}
        onUserSearch={handleUserSearch}
        isSearchingUser={isSearchingUser}
        selectedUser={selectedUser}
        onClearUser={() => setSelectedUser(null)}
      />

      <CategoryToolbar
        activeCategory={activeCategory}
        onChangeCategory={handleCategoryChange}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
      />

      <LoansTable
        currentCategory={activeCategory}
        filteredData={filteredData}
        selectedIds={selectedIds}
        isAllSelected={
          filteredData.length > 0 &&
          filteredData.every((item) => selectedIds.includes(item.id))
        }
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onAddClick={() => openCreateModal(activeCategory)}
        onDeleteClick={openDeleteModal}
        onView={(item) => openModal("view", item)}
        onEdit={(item) => openModal("edit", item)}
      />

      <CreateLoanModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        createLoanType={createLoanType}
        onChangeCreateLoanType={handleCreateLoanTypeChange}
        createSearchTerm={createSearchTerm}
        onChangeCreateSearchTerm={setCreateSearchTerm}
        filteredCreateCatalog={filteredCreateCatalog}
        onAddItem={addItemToLoan}
        selectedLoanItems={selectedLoanItems}
        onChangeItemQuantity={updateItemQuantity}
        onRemoveItem={removeItemFromLoan}
        selectedUser={selectedUser}
        loanDate={loanDate}
        onChangeLoanDate={setLoanDate}
        returnDate={returnDate}
        onChangeReturnDate={setReturnDate}
        onCreateLoan={handleCreateLoan}
      />

      <DeleteLoanModal
        isOpen={isDeleteModalOpen}
        itemsToDelete={itemsToDelete}
        onClose={closeDeleteModal}
        onDelete={handleDeleteSelectedLoans}
      />

      <ManageLoanModal
        mode={modalState.mode}
        selectedItem={selectedItem}
        category={modalState.category}
        formData={formData}
        selectOptions={selectOptions}
        onClose={closeModal}
        onChangeField={handleChange}
        onSave={handleSetLoanChanges}
      />
    </div>
  );
};
