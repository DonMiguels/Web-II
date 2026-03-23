import { useState } from "react";

export const useInventorySelection = (visibleItems = []) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const visibleIds = visibleItems.map((item) => item.id);

    if (
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id))
    ) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    selectedIds,
    handleSelectRow,
    handleSelectAll,
    clearSelection,
  };
};
