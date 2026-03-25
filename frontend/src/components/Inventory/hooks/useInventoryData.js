import { useMemo, useState } from "react";

const initialEquiposData = [
  {
    id: 101,
    description: "Laptop Oficina",
    modelo: "ThinkPad E14",
    marca: "Lenovo",
    condicion: "Bueno",
    estatus: "Disponible",
  },
  {
    id: 102,
    description: "Osciloscopio Digital",
    modelo: "DS1054Z",
    marca: "Rigol",
    condicion: "Bueno",
    estatus: "Mantenimiento",
  },
  {
    id: 103,
    description: "Fuente de alimentación",
    modelo: "KA3005P",
    marca: "Korad",
    condicion: "Dañado",
    estatus: "Ocupado",
  },
];

const initialComponentesData = [
  {
    id: 501,
    description: "Memoria RAM",
    modelo: "Vengeance LPX 16GB",
    marca: "Corsair",
    condicion: "Nuevo",
    estatus: "Stock",
    cantidad: 20,
  },
  {
    id: 502,
    description: "Disco SSD",
    modelo: "980 Pro 1TB",
    marca: "Samsung",
    condicion: "Nuevo",
    estatus: "Disponible",
    cantidad: 15,
  },
  {
    id: 503,
    description: "Microcontrolador",
    modelo: "UNO R3",
    marca: "Arduino",
    condicion: "Nuevo",
    estatus: "Stock",
    cantidad: 8,
  },
];

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
