import { useMemo, useState } from "react";

const initialEquiposData = [
  {
    id: 2001,
    descripcion: "Osciloscopio digital",
    tipo: "Equipo de laboratorio",
    condicion: "Excelente",
    estatus: "Prestado",
    fechaPrestamo: "2026-03-10",
    fechaDevolucion: "2026-03-15",
  },
  {
    id: 2002,
    descripcion: "Multímetro Fluke",
    tipo: "Equipo de medición",
    condicion: "Bueno",
    estatus: "Prestado",
    fechaPrestamo: "2026-03-12",
    fechaDevolucion: "2026-03-18",
  },
  {
    id: 2003,
    descripcion: "Laptop Lenovo ThinkPad",
    tipo: "Equipo portátil",
    condicion: "Usado",
    estatus: "Devuelto",
    fechaPrestamo: "2026-03-01",
    fechaDevolucion: "2026-03-06",
  },
];

const initialInsumosData = [
  {
    id: 3001,
    descripcion: "Resistencias 1kΩ",
    tipo: "Insumo electrónico",
    unidad: "Paquete",
    cantidad: 5,
    condicion: "Nuevo",
    estatus: "Prestado",
    fechaPrestamo: "2026-03-11",
    fechaDevolucion: "2026-03-14",
  },
  {
    id: 3002,
    descripcion: "Protoboard",
    tipo: "Insumo de montaje",
    unidad: "Pieza",
    cantidad: 1,
    condicion: "Bueno",
    estatus: "Devuelto",
    fechaPrestamo: "2026-03-08",
    fechaDevolucion: "2026-03-10",
  },
  {
    id: 3003,
    descripcion: "Cable Dupont",
    tipo: "Insumo de conexión",
    unidad: "Set",
    cantidad: 10,
    condicion: "Nuevo",
    estatus: "Prestado",
    fechaPrestamo: "2026-03-13",
    fechaDevolucion: "2026-03-19",
  },
];

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
