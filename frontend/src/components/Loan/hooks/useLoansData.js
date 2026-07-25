import { useMemo, useState } from "react";

const initialEquiposData = [];

const initialInsumosData = [];

/**
 * Hook de estado para listados de préstamos (equipos e insumos).
 * Gestiona categoría activa, búsqueda, filtrado y mutaciones locales.
 *
 * @returns {{
 *   activeCategory: string,
 *   setActiveCategory: Function,
 *   searchTerm: string,
 *   setSearchTerm: Function,
 *   currentData: Array,
 *   filteredData: Array,
 *   handleSetChanges: Function,
 *   handleDeleteLoans: Function,
 *   setEquiposData: Function,
 *   setInsumosData: Function
 * }} Estado y acciones del listado de préstamos.
 */
export const useLoansData = () => {
  const [activeCategory, setActiveCategory] = useState("equipos");
  const [searchTerm, setSearchTerm] = useState("");
  const [equiposData, setEquiposData] = useState(initialEquiposData);
  const [insumosData, setInsumosData] = useState(initialInsumosData);

  const currentData = activeCategory === "equipos" ? equiposData : insumosData;

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return currentData;
    }

    return currentData.filter((item) => {
      const values = [
        item.descripcion,
        item.tipo,
        item.unidad,
        item.cantidad,
        item.condicion,
        item.estatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return values.includes(term);
    });
  }, [currentData, searchTerm]);

  const handleSetChanges = ({
    category = activeCategory,
    selectedItem,
    formData,
  }) => {
    if (!selectedItem || !formData) {
      return;
    }

    const updateList = (list, setter) => {
      setter(
        list.map((item) =>
          item.id === selectedItem.id ? { ...item, ...formData } : item,
        ),
      );
    };

    if (category === "equipos") {
      updateList(equiposData, setEquiposData);
    } else {
      updateList(insumosData, setInsumosData);
    }
  };

  const handleDeleteLoans = (selectedIds, category = activeCategory) => {
    if (!selectedIds?.length) {
      return;
    }

    if (category === "equipos") {
      setEquiposData((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id)),
      );
      return;
    }

    setInsumosData((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id)),
    );
  };

  return {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    equiposData,
    setEquiposData,
    insumosData,
    setInsumosData,
    currentData,
    filteredData,
    handleSetChanges,
    handleDeleteLoans,
  };
};
