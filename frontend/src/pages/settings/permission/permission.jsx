import React, { useEffect, useState } from "react";
import { ChevronDown, Sun, Moon } from "lucide-react";
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useLocation } from "react-router-dom";
import { MaintenanceCrudSection } from "./components/MaintenanceCrudSection.jsx";
import { runDispatcherTransaction } from "@/Service/dispatcherService";

const CREATE_PERSON_TRANSACTION_ID = 1;
const GET_PERSONS_TRANSACTION_ID = 37;

const splitPersonName = (fullName = "") => {
  const cleaned = String(fullName || "").trim();
  if (!cleaned) {
    return { name: "", lastname: "" };
  }

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { name: parts[0], lastname: "" };
  }

  return {
    name: parts[0],
    lastname: parts.slice(1).join(" "),
  };
};

const Permissions = ({ embedded = false }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [profile, setProfile] = useState("");
  const [subSystem, setSubSystem] = useState("");
  const [moduleClass, setModuleClass] = useState("");

  const [permissions, setPermissions] = useState([]);
  const [personItems, setPersonItems] = useState([]);
  const [personsLoadError, setPersonsLoadError] = useState("");

  const togglePermission = (id) => {
    setPermissions(
      permissions.map((perm) =>
        perm.id === id ? { ...perm, checked: !perm.checked } : perm,
      ),
    );
  };

  const handleAssign = (e) => {
    e.preventDefault();
    const assignedPermissions = permissions.filter((p) => p.checked);
    console.log("Asignando al perfil:", profile);
    console.log("Permisos asignados:", assignedPermissions);
  };

  const selectedCount = permissions.filter((p) => p.checked).length;

  const maintenanceSections = [
    {
      id: "persona",
      title: "Persona",
      nameKey: "nombre",
      searchPlaceholder: "Buscar persona por nombre...",
      columns: [
        { key: "ci", label: "C.I", align: "center" },
        { key: "nombre", label: "Nombre" },
        { key: "correo", label: "Correo" },
        { key: "telefono", label: "Teléfono", align: "center" },
        { key: "direccion", label: "Dirección" },
        { key: "edad", label: "Edad", align: "center" },
      ],
      defaultValues: {
        ci: "",
        nombre: "",
        correo: "",
        telefono: "",
        direccion: "",
        edad: 18,
      },
      initialItems: personItems,
    },
    {
      id: "usuario",
      title: "Usuario",
      nameKey: "nombre",
      searchPlaceholder: "Buscar usuario por nombre...",
      columns: [
        { key: "nombre", label: "Nombre" },
        { key: "password", label: "Contraseña", align: "center" },
        { key: "persona", label: "Persona" },
      ],
      defaultValues: {
        nombre: "",
        password: "",
        persona: "",
      },
      initialItems: [],
    },
    {
      id: "grupo",
      title: "Grupo",
      nameKey: "nombre",
      searchPlaceholder: "Buscar grupo por nombre...",
      columns: [
        { key: "nombre", label: "Nombre" },
        { key: "descripcion", label: "Descripción" },
      ],
      defaultValues: {
        nombre: "",
        descripcion: "",
      },
      initialItems: [],
    },
    {
      id: "perfil",
      title: "Perfil",
      nameKey: "nombre",
      searchPlaceholder: "Buscar perfil por nombre...",
      columns: [
        { key: "nombre", label: "Nombre" },
        { key: "descripcion", label: "Descripción" },
      ],
      defaultValues: {
        nombre: "",
        descripcion: "",
      },
      initialItems: [],
    },
    {
      id: "subsistema",
      title: "Sub-sistema",
      nameKey: "nombre",
      searchPlaceholder: "Buscar sub-sistema por nombre...",
      columns: [
        { key: "nombre", label: "Nombre" },
        { key: "descripcion", label: "Descripción" },
      ],
      defaultValues: {
        nombre: "",
        descripcion: "",
      },
      initialItems: [],
    },
    {
      id: "clase",
      title: "Clase",
      nameKey: "nombre",
      searchPlaceholder: "Buscar clase por nombre...",
      columns: [
        { key: "nombre", label: "Nombre" },
        { key: "descripcion", label: "Descripción" },
      ],
      defaultValues: {
        nombre: "",
        descripcion: "",
      },
      initialItems: [],
    },
    {
      id: "metodo",
      title: "Método",
      nameKey: "nombre",
      searchPlaceholder: "Buscar método por nombre...",
      columns: [
        { key: "nombre", label: "Nombre" },
        { key: "descripcion", label: "Descripción" },
      ],
      defaultValues: {
        nombre: "",
        descripcion: "",
      },
      initialItems: [],
    },
  ];

  const hashSectionId = location.hash.replace("#", "");
  const selectedMaintenanceSection =
    maintenanceSections.find((section) => section.id === hashSectionId) || null;
  const isMaintenanceLanding = hashSectionId === "mantenimiento";
  const isMaintenanceView = Boolean(
    selectedMaintenanceSection || isMaintenanceLanding,
  );
  const currentSectionTitle = selectedMaintenanceSection
    ? selectedMaintenanceSection.title
    : isMaintenanceLanding
      ? "Mantenimiento"
      : "Asignar Permisos";

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const elementId = location.hash.replace("#", "");
    const element = document.getElementById(elementId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  useEffect(() => {
    let isMounted = true;

    const loadPersons = async () => {
      const response = await runDispatcherTransaction({
        transactionId: GET_PERSONS_TRANSACTION_ID,
        data: {},
        profile: user?.profile || user?.profile_name || "admin",
        user,
        lang: "es",
      });

      if (!isMounted) {
        return;
      }

      if (!response?.ok) {
        setPersonsLoadError(
          response?.message || "No se pudo obtener la lista de personas",
        );
        return;
      }

      const rows = Array.isArray(response?.data) ? response.data : [];
      const normalized = rows.map((row, index) => ({
        id: Number(row?.id ?? row?.person_id ?? index + 1),
        ci: String(row?.ci ?? row?.document_id ?? ""),
        nombre: String(row?.nombre ?? row?.name ?? ""),
        correo: String(row?.correo ?? row?.email ?? ""),
        telefono: String(row?.telefono ?? row?.phone ?? ""),
        direccion: String(row?.direccion ?? row?.address ?? ""),
        edad:
          row?.edad == null || row?.edad === ""
            ? ""
            : Number.isNaN(Number(row.edad))
              ? ""
              : Number(row.edad),
      }));

      setPersonsLoadError("");
      setPersonItems(normalized);
    };

    loadPersons();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleCreatePerson = async (itemDraft) => {
    const { name, lastname } = splitPersonName(itemDraft?.nombre);

    const response = await runDispatcherTransaction({
      transactionId: CREATE_PERSON_TRANSACTION_ID,
      data: {
        ci: String(itemDraft?.ci || ""),
        name,
        lastname,
        email: String(itemDraft?.correo || ""),
        phone: String(itemDraft?.telefono || ""),
      },
      profile: user?.profile || user?.profile_name || "admin",
      user,
      lang: "es",
    });

    if (!response?.ok) {
      throw new Error(response?.message || "No se pudo crear la persona");
    }

    return {
      ...itemDraft,
      id: response?.data?.person_id || itemDraft?.id,
    };
  };

  return (
    <div
      className={`${embedded ? "w-full min-h-full flex flex-col" : "flex h-screen w-full"} transition-colors duration-500 relative overflow-hidden font-sans`}
    >
      {!embedded && (
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(${theme === "dark" ? "#ffffff" : "#000000"} 1px, transparent 1px), linear-gradient(90deg, ${theme === "dark" ? "#ffffff" : "#000000"} 1px, transparent 1px)`,
            backgroundSize: "45px 45px",
          }}
        />
      )}

      {!embedded && (
        <div className="absolute top-6 right-6 md:top-8 md:right-10 z-50 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f1115]/50 backdrop-blur-md h-10 w-10 hover:scale-105 transition-transform shadow-sm"
          >
            {theme === "light" ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} className="text-yellow-400" />
            )}
          </Button>
        </div>
      )}

      {!embedded && <Sidebar />}

      <div
        className={`flex-1 p-6 md:p-8 relative overflow-hidden flex flex-col min-h-0 ${embedded ? "w-full" : "h-screen pl-24 md:pl-28"}`}
      >
        {!embedded && (
          <div
            className={`${embedded ? "w-full" : "w-full max-w-6xl mx-auto"} flex flex-col md:flex-row items-center justify-between mb-4 md:mb-6 shrink-0 relative z-10`}
          >
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {`CONFIGURACION - ${currentSectionTitle}`}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-1">
                  GESTIÓN DE PERMISOS • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className={`${embedded ? "w-full" : "w-full max-w-6xl mx-auto"} flex-1 flex flex-col relative z-10 pb-4 h-full min-h-0`}
        >
          <div
            className={`${
              embedded
                ? "w-full flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar"
                : "w-full flex flex-col bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md p-6 md:p-8 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-2xl h-full min-h-0 overflow-y-auto custom-scrollbar"
            }`}
          >
            {!isMaintenanceView ? (
              <form
                onSubmit={handleAssign}
                className="flex flex-col flex-1 h-full min-h-0 gap-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 shrink-0">
                  <div id="perfil-asignar" className="space-y-1.5 scroll-mt-24">
                    <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                      Seleccionar Perfil
                    </label>
                    <div className="relative">
                      <select
                        value={profile}
                        onChange={(e) => setProfile(e.target.value)}
                        className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-slate-700 dark:text-slate-200 text-sm transition-all cursor-pointer"
                      >
                        <option value="" className="dark:bg-[#0a0a0c]">
                          Seleccionar...
                        </option>
                        <option
                          value="administrador"
                          className="dark:bg-[#0a0a0c]"
                        >
                          Administrador
                        </option>
                        <option value="profesor" className="dark:bg-[#0a0a0c]">
                          Profesor
                        </option>
                        <option
                          value="estudiante"
                          className="dark:bg-[#0a0a0c]"
                        >
                          Estudiante
                        </option>
                      </select>
                      <ChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  <div
                    id="subsistema-asignar"
                    className="space-y-1.5 scroll-mt-24"
                  >
                    <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                      Sub-Sistema
                    </label>
                    <div className="relative">
                      <select
                        value={subSystem}
                        onChange={(e) => setSubSystem(e.target.value)}
                        className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-slate-700 dark:text-slate-200 text-sm transition-all cursor-pointer"
                      >
                        <option value="" className="dark:bg-[#0a0a0c]">
                          Seleccionar...
                        </option>
                        <option value="Equipo" className="dark:bg-[#0a0a0c]">
                          Académico
                        </option>
                        <option value="Persona" className="dark:bg-[#0a0a0c]">
                          Administrativo
                        </option>
                        <option value="Prestamos" className="dark:bg-[#0a0a0c]">
                          Recursos Humanos
                        </option>
                      </select>
                      <ChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  <div id="clases-asignar" className="space-y-1.5 scroll-mt-24">
                    <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                      Clases
                    </label>
                    <div className="relative">
                      <select
                        value={moduleClass}
                        onChange={(e) => setModuleClass(e.target.value)}
                        className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-slate-700 dark:text-slate-200 text-sm transition-all cursor-pointer"
                      >
                        <option value="" className="dark:bg-[#0a0a0c]">
                          Seleccionar...
                        </option>
                        <option value="usuarios" className="dark:bg-[#0a0a0c]">
                          Usuarios
                        </option>
                        <option value="reportes" className="dark:bg-[#0a0a0c]">
                          Reportes
                        </option>
                        <option
                          value="notificaciones"
                          className="dark:bg-[#0a0a0c]"
                        >
                          Notificaciones
                        </option>
                      </select>
                      <ChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                      Métodos y Permisos
                    </label>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      {selectedCount} Seleccionados
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl p-4 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map((perm) => (
                        <div
                          key={perm.id}
                          onClick={() => togglePermission(perm.id)}
                          className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                            perm.checked
                              ? "bg-white dark:bg-[#1a1d24] border-blue-500/30 shadow-sm"
                              : "bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10"
                          }`}
                        >
                          <div className="pt-0.5 shrink-0">
                            <input
                              type="checkbox"
                              checked={perm.checked}
                              readOnly
                              className="accent-blue-600 w-4 h-4 cursor-pointer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-bold truncate mb-1 ${perm.checked ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-white"}`}
                            >
                              {perm.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 shrink-0">
                  <Button
                    type="submit"
                    disabled={
                      !profile ||
                      !subSystem ||
                      !moduleClass ||
                      selectedCount === 0
                    }
                    className="w-full md:w-auto md:ml-auto md:min-w-[200px] flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-widest text-[11px] disabled:opacity-50 disabled:active:scale-100"
                  >
                    Guardar Permisos
                  </Button>
                </div>
              </form>
            ) : (
              <div id="mantenimiento" className="pt-2 scroll-mt-24">
                {selectedMaintenanceSection ? (
                  <>
                    {selectedMaintenanceSection.id === "persona" &&
                    personsLoadError ? (
                      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                        {personsLoadError}
                      </div>
                    ) : null}
                    <MaintenanceCrudSection
                      sectionId={selectedMaintenanceSection.id}
                      title={selectedMaintenanceSection.title}
                      searchPlaceholder={
                        selectedMaintenanceSection.searchPlaceholder
                      }
                      columns={selectedMaintenanceSection.columns}
                      nameKey={selectedMaintenanceSection.nameKey}
                      initialItems={selectedMaintenanceSection.initialItems}
                      defaultValues={selectedMaintenanceSection.defaultValues}
                      onCreateItem={
                        selectedMaintenanceSection.id === "persona"
                          ? handleCreatePerson
                          : null
                      }
                    />
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] p-5">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Selecciona una sub-sección de mantenimiento en el menú
                      lateral para gestionar su CRUD de forma independiente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
