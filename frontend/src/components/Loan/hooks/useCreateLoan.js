import { useMemo, useState } from "react";
import { loanCatalog } from "../constants";
import { addDays, toDateInput } from "../utils/date";

export const useCreateLoan = ({
  selectedUser,
  setEquiposData,
  setInsumosData,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoanType, setCreateLoanType] = useState("equipos");
  const [createSearchTerm, setCreateSearchTerm] = useState("");
  const [selectedLoanItems, setSelectedLoanItems] = useState([]);
  const [loanDate, setLoanDate] = useState(toDateInput(new Date()));
  const [returnDate, setReturnDate] = useState(addDays(new Date(), 7));

  const openCreateModal = (category) => {
    setCreateLoanType(category);
    setCreateSearchTerm("");
    setSelectedLoanItems([]);
    setLoanDate(toDateInput(new Date()));
    setReturnDate(addDays(new Date(), 7));
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedLoanItems([]);
    setCreateSearchTerm("");
  };

  const createCatalog = loanCatalog[createLoanType];

  const filteredCreateCatalog = useMemo(() => {
    const term = createSearchTerm.trim().toLowerCase();
    const excludedKeys = new Set(
      selectedLoanItems.map(
        (item) => `${item.category || createLoanType}-${item.id}`,
      ),
    );

    return createCatalog.filter((item) => {
      if (excludedKeys.has(`${createLoanType}-${item.id}`)) {
        return false;
      }

      const values = [item.titulo, item.descripcion, item.tipo, item.condicion]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !term || values.includes(term);
    });
  }, [createCatalog, createSearchTerm, selectedLoanItems, createLoanType]);

  const addItemToLoan = (item) => {
    setSelectedLoanItems((prev) =>
      prev.some(
        (selected) =>
          (selected.category || createLoanType) === createLoanType &&
          selected.id === item.id,
      )
        ? prev
        : [
            ...prev,
            {
              ...item,
              category: createLoanType,
              cantidad: createLoanType === "insumos" ? 1 : undefined,
            },
          ],
    );
  };

  const updateItemQuantity = (id, quantity) => {
    setSelectedLoanItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: quantity } : item,
      ),
    );
  };

  const removeItemFromLoan = (id) => {
    setSelectedLoanItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateLoan = () => {
    if (!selectedUser || selectedLoanItems.length === 0) {
      return;
    }

    const buildRecords = (items, list) => {
      const lastId = list.reduce(
        (max, item) => Math.max(max, Number(item.id) || 0),
        0,
      );

      return items.map((item, index) => ({
        id: lastId + index + 1,
        descripcion: item.titulo,
        tipo: item.tipo,
        cantidad: item.cantidad ?? 1,
        condicion: item.condicion,
        estatus: "Prestado",
        fechaPrestamo: loanDate,
        fechaDevolucion: returnDate,
        usuario: selectedUser,
      }));
    };

    const selectedEquipos = selectedLoanItems.filter(
      (item) => (item.category || createLoanType) === "equipos",
    );
    const selectedInsumos = selectedLoanItems.filter(
      (item) => (item.category || createLoanType) === "insumos",
    );

    if (selectedEquipos.length > 0) {
      setEquiposData((prev) => [
        ...prev,
        ...buildRecords(selectedEquipos, prev),
      ]);
    }

    if (selectedInsumos.length > 0) {
      setInsumosData((prev) => [
        ...prev,
        ...buildRecords(selectedInsumos, prev),
      ]);
    }

    closeCreateModal();
  };

  return {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createLoanType,
    setCreateLoanType,
    createSearchTerm,
    setCreateSearchTerm,
    selectedLoanItems,
    setSelectedLoanItems,
    loanDate,
    setLoanDate,
    returnDate,
    setReturnDate,
    createCatalog,
    filteredCreateCatalog,
    addItemToLoan,
    removeItemFromLoan,
    updateItemQuantity,
    handleCreateLoan,
  };
};
