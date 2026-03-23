import { useMemo, useState } from "react";
import { Table } from "@/components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  User,
  ShieldCheck,
  Users,
  IdCard,
  Loader2,
  Eye,
  Pencil,
  Monitor,
  Package,
  BadgeInfo,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

const loanCatalog = {
  equipos: [
    {
      id: "eq-1",
      titulo: "Osciloscopio Tektronix",
      descripcion: "Equipo de medición para análisis de señales.",
      tipo: "Equipo de laboratorio",
      condicion: "Excelente",
    },
    {
      id: "eq-2",
      titulo: "Multímetro Fluke",
      descripcion: "Instrumento para medición de voltaje y resistencia.",
      tipo: "Equipo de medición",
      condicion: "Bueno",
    },
    {
      id: "eq-3",
      titulo: "Laptop Lenovo",
      descripcion: "Portátil asignable para actividades académicas.",
      tipo: "Equipo portátil",
      condicion: "Usado",
    },
    {
      id: "eq-3",
      titulo: "Laptop Lenovo",
      descripcion: "Portátil asignable para actividades académicas.",
      tipo: "Equipo portátil",
      condicion: "Usado",
    },
    {
      id: "eq-456465",
      titulo: "Laptop Lenovo",
      descripcion: "Portátil asignable para actividades académicas.",
      tipo: "Equipo portátil",
      condicion: "Usado",
    },
    {
      id: "eq-65",
      titulo: "Laptop Lenovo",
      descripcion: "Portátil asignable para actividades académicas.",
      tipo: "Equipo portátil",
      condicion: "Usado",
    },
    {
      id: "eq-6",
      titulo: "Laptop Lenovo",
      descripcion: "Portátil asignable para actividades académicas.",
      tipo: "Equipo portátil",
      condicion: "Usado",
    },
    {
      id: "eq-5",
      titulo: "Laptop Lenovo",
      descripcion: "Portátil asignable para actividades académicas.",
      tipo: "Equipo portátil",
      condicion: "Usado",
    },
  ],
  insumos: [
    {
      id: "in-1",
      titulo: "Resistencias 1kΩ",
      descripcion: "Paquete de resistencias para prototipado.",
      tipo: "Insumo electrónico",
      condicion: "Nuevo",
    },
    {
      id: "in-2",
      titulo: "Protoboard",
      descripcion: "Base de montaje para pruebas de circuito.",
      tipo: "Insumo de montaje",
      condicion: "Bueno",
    },
    {
      id: "in-3",
      titulo: "Cable Dupont",
      descripcion: "Set de cables para conexión rápida.",
      tipo: "Insumo de conexión",
      condicion: "Nuevo",
    },
  ],
};

const toDateInput = (date) => new Date(date).toISOString().split("T")[0];

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toDateInput(next);
};

const TransferItemCard = ({
  title,
  onAction,
  actionIcon: ActionIcon,
  actionClassName,
  toneClassName,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${toneClassName}`}
    >
      <h6 className="min-w-0 truncate font-bold text-slate-800 dark:text-white">
        {title}
      </h6>
      <button
        type="button"
        onClick={onAction}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${actionClassName}`}
      >
        <ActionIcon size={12} />
      </button>
    </div>
  );
};

export const Loan = () => {
  const [activeCategory, setActiveCategory] = useState("equipos");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoanType, setCreateLoanType] = useState("equipos");
  const [createSearchTerm, setCreateSearchTerm] = useState("");
  const [selectedLoanItems, setSelectedLoanItems] = useState([]);
  const [loanDate, setLoanDate] = useState(toDateInput(new Date()));
  const [returnDate, setReturnDate] = useState(addDays(new Date(), 7));
  const [equiposData, setEquiposData] = useState([
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
  ]);

  const [insumosData, setInsumosData] = useState([
    {
      id: 3001,
      descripcion: "Resistencias 1kΩ",
      tipo: "Insumo electrónico",
      condicion: "Nuevo",
      estatus: "Prestado",
      fechaPrestamo: "2026-03-11",
      fechaDevolucion: "2026-03-14",
    },
    {
      id: 3002,
      descripcion: "Protoboard",
      tipo: "Insumo de montaje",
      condicion: "Bueno",
      estatus: "Devuelto",
      fechaPrestamo: "2026-03-08",
      fechaDevolucion: "2026-03-10",
    },
    {
      id: 3003,
      descripcion: "Cable Dupont",
      tipo: "Insumo de conexión",
      condicion: "Nuevo",
      estatus: "Prestado",
      fechaPrestamo: "2026-03-13",
      fechaDevolucion: "2026-03-19",
    },
  ]);

  const [modalState, setModalState] = useState({ mode: null, category: null });
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fieldLabels = {
    descripcion: "Descripción",
    tipo: "Tipo",
    condicion: "Condición",
    estatus: "Estatus",
    fechaPrestamo: "Fecha de préstamo",
    fechaDevolucion: "Fecha de devolución",
  };

  const currentData = activeCategory === "equipos" ? equiposData : insumosData;

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return currentData;
    }

    return currentData.filter((item) => {
      const values = [item.descripcion, item.tipo, item.condicion, item.estatus]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return values.includes(term);
    });
  }, [currentData, searchTerm]);

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

  const handleUserSearch = (e) => {
    if (e.key !== "Enter" || !userSearchTerm.trim()) {
      return;
    }

    setIsSearchingUser(true);

    setTimeout(() => {
      setSelectedUser({
        name: "Marcelo Perozo",
        ci: userSearchTerm.trim(),
        profile: "Estudiante",
        group: "Física 2",
      });
      setIsSearchingUser(false);
    }, 700);
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredData.map((item) => item.id);

    if (
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id))
    ) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
  };

  const openCreateModal = () => {
    setCreateLoanType(activeCategory);
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

  const addItemToLoan = (item) => {
    setSelectedLoanItems((prev) =>
      prev.some(
        (selected) =>
          (selected.category || createLoanType) === createLoanType &&
          selected.id === item.id,
      )
        ? prev
        : [...prev, { ...item, category: createLoanType }],
    );
  };

  const removeItemFromLoan = (id) => {
    setSelectedLoanItems((prev) => prev.filter((item) => item.id !== id));
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

  const handleDeleteLoans = () => {
    if (activeCategory === "equipos") {
      setEquiposData((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id)),
      );
    } else {
      setInsumosData((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id)),
      );
    }

    setSelectedIds([]);
    closeDeleteModal();
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

  const currentHeaders =
    activeCategory === "equipos"
      ? [
          { label: "Descripción", align: "left" },
          { label: "Tipo", align: "left" },
          { label: "Condición", align: "center" },
          { label: "Estatus", align: "center" },
          { label: "Fecha de préstamo", align: "center" },
          { label: "Fecha de devolución", align: "center" },
        ]
      : [
          { label: "Descripción", align: "left" },
          { label: "Tipo", align: "left" },
        ];

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

  const handleSetChanges = () => {
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

    if (modalState.category === "equipos") {
      updateList(equiposData, setEquiposData);
    } else {
      updateList(insumosData, setInsumosData);
    }

    closeModal();
  };

  const renderValue = (value) => value || "—";

  const renderModalFields = (item, editable = false) => (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(fieldLabels).map(([field, label]) => {
        const isDateField =
          field === "fechaPrestamo" || field === "fechaDevolucion";
        const value = editable ? (formData?.[field] ?? "") : item?.[field];

        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">
              {label}
            </Label>
            {editable ? (
              <Input
                value={value}
                type={isDateField ? "date" : "text"}
                onChange={(e) => handleChange(field, e.target.value)}
                className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c]"
              />
            ) : (
              <div className="min-h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                {renderValue(value)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const itemsToDelete = currentData.filter((item) =>
    selectedIds.includes(item.id),
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-md p-4 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-4">
          {isSearchingUser ? (
            <div className="w-full flex items-center justify-center gap-3 text-blue-600 font-bold italic py-4">
              <Loader2 className="animate-spin" size={20} />
              <span>Buscando información del usuario...</span>
            </div>
          ) : !selectedUser ? (
            <div className="relative w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                onKeyDown={handleUserSearch}
                placeholder="Ingrese Cédula de Identidad y presione Enter para iniciar el préstamo..."
                className="w-full bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-slate-200"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <User size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white leading-none">
                    {selectedUser.name}
                  </h2>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <IdCard size={13} className="text-blue-500" />
                      {selectedUser.ci}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <ShieldCheck size={13} className="text-green-500" />
                      {selectedUser.profile}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <Users size={13} className="text-purple-500" />
                      {selectedUser.group}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="w-full bg-slate-100 dark:bg-black/20 p-1 rounded-xl border border-slate-200 dark:border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
            <div className="flex flex-wrap gap-2 w-fit">
              <button
                onClick={() => {
                  setActiveCategory("equipos");
                  setSelectedIds([]);
                }}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeCategory === "equipos"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Monitor size={18} /> Equipos
              </button>
              <button
                onClick={() => {
                  setActiveCategory("insumos");
                  setSelectedIds([]);
                }}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeCategory === "insumos"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Package size={18} /> Insumos
              </button>
            </div>

            <div className="relative w-full lg:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, descripción o tipo..."
                className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      <Table
        title={`Préstamos de ${activeCategory === "equipos" ? "Equipos" : "Insumos"}`}
        headers={currentHeaders}
        showId={false}
        showSelection={true}
        showToolbarActions={true}
        isAllSelected={
          filteredData.length > 0 &&
          filteredData.every((item) => selectedIds.includes(item.id))
        }
        onSelectAll={handleSelectAll}
        onAddClick={openCreateModal}
        onDeleteClick={openDeleteModal}
      >
        {filteredData.map((loan) => (
          <tr
            key={`${activeCategory}-${loan.id}`}
            className={`hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-colors ${selectedIds.includes(loan.id) ? "bg-blue-50/30 dark:bg-blue-500/5" : ""}`}
          >
            <td className="py-4 px-4 w-12">
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(loan.id)}
                  onChange={() => handleSelectRow(loan.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                />
              </div>
            </td>
            <td className="py-4 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-[10px] font-black uppercase">
                  <BadgeInfo size={14} />
                </div>
                {loan.descripcion}
              </div>
            </td>
            <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
              {loan.tipo}
            </td>
            {activeCategory === "equipos" ? (
              <>
                <td className="py-4 px-4 text-center text-slate-500">
                  {loan.condicion}
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      loan.estatus === "Devuelto"
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    }`}
                  >
                    {loan.estatus}
                  </span>
                </td>
                <td className="py-4 px-4 text-center text-slate-500">
                  {loan.fechaPrestamo}
                </td>
                <td className="py-4 px-4 text-center text-slate-500">
                  {loan.fechaDevolucion}
                </td>
              </>
            ) : null}
            <td className="py-4 px-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => openModal("view", loan)}
                  className="p-2 rounded-xl text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                  title="Ver detalle"
                >
                  <Eye size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => openModal("edit", loan)}
                  className="p-2 rounded-xl text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                  title="Editar préstamo"
                >
                  <Pencil size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-7xl max-h-[92vh] overflow-y-auto rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
                  Nuevo préstamo
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
                  Agregar préstamo
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Selecciona equipos o insumos y completa los datos del
                  préstamo.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-2xl p-3 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-6 p-6 xl:grid-cols-2">
              <div className="space-y-4 rounded-[28px] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      Catálogo
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Filtra y mueve elementos al préstamo.
                    </p>
                  </div>

                  <div className="w-40 shrink-0">
                    <Label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Tipo
                    </Label>
                    <select
                      value={createLoanType}
                      onChange={(e) => {
                        setCreateLoanType(e.target.value);
                        setCreateSearchTerm("");
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] px-3 py-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="equipos">Equipos</option>
                      <option value="insumos">Insumos</option>
                    </select>
                  </div>
                </div>

                <div className="relative w-full">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={createSearchTerm}
                    onChange={(e) => setCreateSearchTerm(e.target.value)}
                    placeholder="Buscar en catálogo..."
                    className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">
                          Disponibles
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Pulsa el botón para agregarlos.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                        {filteredCreateCatalog.length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredCreateCatalog.length > 0 ? (
                        filteredCreateCatalog.map((item) => (
                          <TransferItemCard
                            key={item.id}
                            title={item.titulo}
                            onAction={() => addItemToLoan(item)}
                            actionIcon={ChevronRight}
                            actionClassName="bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
                            toneClassName="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                          />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          No hay resultados para este filtro.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">
                          Seleccionados
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Elementos asignados a este préstamo.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                        {selectedLoanItems.length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                      {selectedLoanItems.length > 0 ? (
                        selectedLoanItems.map((item) => (
                          <TransferItemCard
                            key={item.id}
                            title={item.titulo}
                            onAction={() => removeItemFromLoan(item.id)}
                            actionIcon={X}
                            actionClassName="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                            toneClassName="border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5"
                          />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          Aún no hay elementos agregados.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
                <div>
                  <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    Datos del préstamo
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verifica el usuario, las fechas y confirma la asignación.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                  <Label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Usuario asignado
                  </Label>

                  {selectedUser ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        value={selectedUser.name}
                        readOnly
                        className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                      />
                      <Input
                        value={selectedUser.profile}
                        readOnly
                        className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                      />
                      <Input
                        value={selectedUser.group}
                        readOnly
                        className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
                      Busca primero al usuario para poder asignar el préstamo.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Elementos seleccionados
                    </Label>
                    <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                      {selectedLoanItems.length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {selectedLoanItems.length > 0 ? (
                      selectedLoanItems.map((item) => (
                        <div
                          key={`summary-${item.id}`}
                          className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between gap-3"
                        >
                          <span className="truncate">{item.titulo}</span>
                          <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 shrink-0">
                            {(item.category || createLoanType) === "equipos"
                              ? "Equipo"
                              : "Insumo"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-5 text-sm text-slate-500 dark:text-slate-400">
                        No hay elementos seleccionados aún.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <CalendarDays size={14} /> Fecha de préstamo
                    </Label>
                    <Input
                      type="date"
                      value={loanDate}
                      onChange={(e) => setLoanDate(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                    />
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] p-4">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <CalendarDays size={14} /> Fecha de devolución
                    </Label>
                    <Input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateLoan}
                  disabled={!selectedUser || selectedLoanItems.length === 0}
                  className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] shadow-2xl">
            <div className="border-b border-slate-100 dark:border-white/5 p-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">
                Se eliminará lo siguiente...
              </h3>
            </div>

            <div className="p-6">
              <div className="max-h-52 overflow-y-auto">
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-200">
                  {itemsToDelete.map((item) => (
                    <li key={item.id}>{item.descripcion}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLoans}
                  className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {modalState.mode && selectedItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
                  {modalState.mode === "view" ? "Vista rápida" : "Edición"}
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
                  {selectedItem.descripcion}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedItem.tipo}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
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
                    {modalState.category}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    ID
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    #{selectedItem.id}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Estatus
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    {selectedItem.estatus}
                  </p>
                </div>
              </div>

              {modalState.mode === "view"
                ? renderModalFields(selectedItem, false)
                : renderModalFields(selectedItem, true)}

              {modalState.mode === "edit" ? (
                <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSetChanges}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
                  >
                    Establecer
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
