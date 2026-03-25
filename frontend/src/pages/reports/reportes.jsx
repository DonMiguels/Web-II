import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar/Sidebar";

const Reports = ({ embedded = false }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [periodos, setPeriodos] = useState([]);
  const [tiposReporte, setTiposReporte] = useState([]);

  const [formData, setFormData] = useState({
    periodo: "",
    fechaDesde: "",
    fechaHasta: "",
    tipoReporte: "",
  });

  useEffect(() => {
    // Simulacion de objetos de negocio desde el backend
    setPeriodos([
      { id: "1", nombre: "2026-A" },
      { id: "2", nombre: "2026-B" },
      { id: "3", nombre: "2026-C" },
    ]);

    setTiposReporte([
      { id: "inv", nombre: "Inventario de Equipos" },
      { id: "pre", nombre: "Historial de Préstamos" },
      { id: "usu", nombre: "Actividad de Usuarios" },
    ]);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className={`${embedded ? "w-full" : "flex h-screen w-full"} bg-slate-50 dark:bg-[#0a0a0c] transition-colors duration-500 relative overflow-hidden font-sans`}
    >
      {!embedded && <Sidebar />}

      <div className="absolute top-6 right-6 md:top-8 md:right-10 z-50 flex items-center gap-4 md:gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl border-blue-500/20 cursor-pointer"
        >
          {theme === "light" ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} className="text-yellow-400" />
          )}
        </Button>
      </div>

      <div className="flex-1 p-6 md:p-8 relative overflow-y-auto custom-scrollbar flex flex-col">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto flex flex-col gap-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start justify-between gap-4 w-full"
          >
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Reportes
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                PANEL DE LA URU • {new Date().toLocaleDateString("es-ES")}
              </p>
            </div>
          </motion.div>

          <div className="flex-1 flex items-start justify-center pt-10 pb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md rounded-[24px] border border-slate-100 dark:border-white/5 shadow-2xl p-4 md:p-5 mx-auto"
            >
              <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
                Generar Reporte Personalizado
              </h2>

              <form className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                    Período
                  </label>
                  <div className="relative">
                    <select
                      name="periodo"
                      value={formData.periodo}
                      onChange={handleChange}
                      className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-900 dark:text-white text-sm transition-all cursor-pointer"
                    >
                      <option value="" className="dark:bg-[#0a0a0c]">
                        Seleccionar periodo...
                      </option>
                      {periodos.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          className="dark:bg-[#0a0a0c]"
                        >
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                      Desde
                    </label>
                    <input
                      type="date"
                      name="fechaDesde"
                      onChange={handleChange}
                      className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white text-sm scheme-light dark:scheme-dark"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                      Hasta
                    </label>
                    <input
                      type="date"
                      name="fechaHasta"
                      onChange={handleChange}
                      className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white text-sm scheme-light dark:scheme-dark"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                    Tipo de Reporte
                  </label>
                  <div className="relative">
                    <select
                      name="tipoReporte"
                      value={formData.tipoReporte}
                      onChange={handleChange}
                      className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-900 dark:text-white text-sm transition-all cursor-pointer"
                    >
                      <option value="" className="dark:bg-[#0a0a0c]">
                        Seleccionar categoría...
                      </option>
                      {tiposReporte.map((t) => (
                        <option
                          key={t.id}
                          value={t.id}
                          className="dark:bg-[#0a0a0c]"
                        >
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
                >
                  Generar Documento
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
