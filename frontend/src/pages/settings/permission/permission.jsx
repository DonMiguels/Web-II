import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sun, Moon } from "lucide-react";
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useLocation } from "react-router-dom";
import { MaintenanceCrudSection } from "./components/MaintenanceCrudSection.jsx";

const Permissions = ({ embedded = false }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [profile, setProfile] = useState("");
  const [subSystem, setSubSystem] = useState("");
  const [moduleClass, setModuleClass] = useState("");

  // Prueba
  const [permissions, setPermissions] = useState([
    {
      id: "1",
      name: "createUser",
      description: "Permite la creación de nuevos usuarios en el sistema.",
      checked: true,
    },
    {
      id: "2",
      name: "findUser",
      description:
        "Permite la búsqueda y lectura de la información de los usuarios.",
      checked: true,
    },
    {
      id: "3",
      name: "deleteUser",
      description: "Permite eliminar usuarios existentes de la base de datos.",
      checked: false,
    },
    {
      id: "4",
      name: "updateUser",
      description:
        "Permite modificar la información y datos de usuarios existentes.",
      checked: false,
    },
    {
      id: "5",
      name: "assignRole",
      description: "Permite asignar o remover roles a los usuarios.",
      checked: false,
    },
    {
      id: "6",
      name: "resetPassword",
      description: "Permite reiniciar la contraseña de un usuario.",
      checked: false,
    },
    {
      id: "7",
      name: "exportUsers",
      description:
        "Permite exportar la lista de usuarios en formato Excel o CSV.",
      checked: false,
    },
  ]);

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
      initialItems: [
        {
          id: 1,
          ci: "31005749",
          nombre: "Marcelo Perozo",
          correo: "marcelo@uru.edu",
          telefono: "0414-0000001",
          direccion: "Av. Universidad, Maracaibo",
          edad: 24,
        },
        {
          id: 2,
          ci: "24123456",
          nombre: "Miguel Sanchez",
          correo: "miguel@uru.edu",
          telefono: "0414-0000002",
          direccion: "Urbanización Lago Azul",
          edad: 27,
        },
      ],
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
      initialItems: [
        {
          id: 1,
          nombre: "super_admin",
          password: "Admin123!@#",
          persona: "Marcelo Perozo",
        },
        {
          id: 2,
          nombre: "analista_uru",
          password: "Analista2026*",
          persona: "Miguel Sanchez",
        },
      ],
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
      initialItems: [
        {
          id: 1,
          nombre: "Laboratorio A",
          descripcion: "Grupo de electrónica básica",
        },
        {
          id: 2,
          nombre: "Investigación",
          descripcion: "Equipo de pruebas avanzadas",
        },
      ],
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
      initialItems: [
        {
          id: 1,
          nombre: "Administrador",
          descripcion: "Control total del sistema",
        },
        {
          id: 2,
          nombre: "Docente",
          descripcion: "Gestión académica y préstamos",
        },
      ],
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
      initialItems: [
        {
          id: 1,
          nombre: "Inventario",
          descripcion: "Módulo de activos e insumos",
        },
        {
          id: 2,
          nombre: "Préstamos",
          descripcion: "Gestión de préstamos de laboratorio",
        },
      ],
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
      initialItems: [
        { id: 1, nombre: "User", descripcion: "Operaciones CRUD de usuarios" },
        {
          id: 2,
          nombre: "Profile",
          descripcion: "Gestión de perfiles y permisos",
        },
      ],
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
      initialItems: [
        {
          id: 1,
          nombre: "createUser",
          descripcion: "Crea usuarios del sistema",
        },
        {
          id: 2,
          nombre: "assignProfile",
          descripcion: "Asigna perfiles a usuarios",
        },
      ],
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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
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
                  />
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
        </motion.div>
      </div>
    </div>
  );
};

export default Permissions;
