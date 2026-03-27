import { useMemo, useState } from "react";

const initialEquiposData = [];

const initialComponentesData = [];

export const useInventoryData = () => {
  const [activeCategory, setActiveCategory] = useState("equipos");
  const [searchTerm, setSearchTerm] = useState("");
  const [equiposData, setEquiposData] = useState(initialEquiposData);
  const [componentesData, setComponentesData] = useState(
    initialComponentesData,
  );

  const currentData =
    activeCategory === "equipos" ? equiposData : componentesData;

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return currentData;
    }

    return currentData.filter((item) => {
      const values = [
        item.description,
        item.modelo,
        item.marca,
        item.condicion,
        item.estatus,
        item.cantidad,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return values.includes(term);
    });
  }, [currentData, searchTerm]);

  const getNextId = (list) =>
    list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

  const handleCreateItem = ({ category = activeCategory, formData }) => {
    if (!formData) {
      return;
    }

    const targetSetter =
      category === "equipos" ? setEquiposData : setComponentesData;

    targetSetter((prev) => [
      ...prev,
      {
        id: getNextId(prev),
        ...formData,
        ...(category === "equipos" ? { cantidad: undefined } : {}),
      },
    ]);
  };

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
          item.id === selectedItem.id
            ? {
                ...item,
                ...formData,
                ...(category === "equipos" ? { cantidad: undefined } : {}),
              }
            : item,
        ),
      );
    };

    if (category === "equipos") {
      updateList(equiposData, setEquiposData);
      return;
    }

    updateList(componentesData, setComponentesData);
  };

  const handleDeleteItems = (selectedIds, category = activeCategory) => {
    if (!selectedIds?.length) {
      return;
    }

    if (category === "equipos") {
      setEquiposData((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id)),
      );
      return;
    }

    setComponentesData((prev) =>
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
    componentesData,
    setComponentesData,
    currentData,
    filteredData,
    handleCreateItem,
    handleSetChanges,
    handleDeleteItems,
  };
};
