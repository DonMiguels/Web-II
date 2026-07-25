import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sun, Moon, Search } from "lucide-react";
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar/Sidebar";

/**
 * Página para asignar perfiles a usuarios.
 *
 * @param {Object} props - Props del componente.
 * @param {boolean} [props.embedded=false] - Si es `true`, se renderiza embebida en el dashboard.
 * @returns {JSX.Element} Vista de asignación de perfiles.
 */
const AssignProfile = ({ embedded = false }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState([]);

  const toggleUser = (id) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, checked: !u.checked } : u)),
    );
  };

  const handleAssign = (e) => {
    e.preventDefault();
    const assignedUsers = users.filter((u) => u.checked);
    console.log("Perfil seleccionado:", profile);
    console.log("Usuarios asignados:", assignedUsers);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.document.includes(searchTerm),
  );

  const selectedCount = users.filter((u) => u.checked).length;

  return (
    <div
      className={`${embedded ? "w-full h-full" : "flex h-screen w-full"} transition-colors duration-500 relative overflow-hidden font-sans`}
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
        className={`flex-1 p-6 md:p-8 relative overflow-hidden flex flex-col min-h-0 ${embedded ? "h-full" : "h-screen pl-24 md:pl-28"}`}
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
                  CONFIGURACION - ASIGNAR PERFIL
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-1">
                  GESTIÓN DE PERFILES • {new Date().toLocaleDateString()}
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
                ? "w-full flex flex-col h-full min-h-0"
                : "w-full flex flex-col bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md p-6 md:p-8 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-2xl h-full min-h-0"
            }`}
          >
            <form
              onSubmit={handleAssign}
              className="flex flex-col flex-1 h-full min-h-0 gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 shrink-0">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                    Buscar Usuario
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Nombre o cédula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
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
                        Seleccionar perfil a asignar...
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
                      <option value="estudiante" className="dark:bg-[#0a0a0c]">
                        Estudiante
                      </option>
                      <option value="invitado" className="dark:bg-[#0a0a0c]">
                        Invitado
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
                    Usuarios Encontrados
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                    {selectedCount} Seleccionados
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl p-4 custom-scrollbar">
                  {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => toggleUser(u.id)}
                          className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                            u.checked
                              ? "bg-white dark:bg-[#1a1d24] border-blue-500/30 shadow-sm"
                              : "bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10"
                          }`}
                        >
                          <div className="shrink-0">
                            <input
                              type="checkbox"
                              checked={u.checked}
                              readOnly
                              className="accent-blue-600 w-4 h-4 cursor-pointer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-bold truncate mb-0.5 ${u.checked ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-white"}`}
                            >
                              {u.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {u.document} • {u.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                      <Search size={32} className="mb-2 opacity-50" />
                      <p className="text-sm font-medium">
                        No se encontraron usuarios
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 shrink-0">
                <Button
                  type="submit"
                  disabled={!profile || selectedCount === 0}
                  className="w-full md:w-auto md:ml-auto md:min-w-[200px] flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-widest text-[11px] disabled:opacity-50 disabled:active:scale-100"
                >
                  Asignar Perfil
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Exportación por defecto de la página de asignación de perfiles.
 */
export default AssignProfile;
