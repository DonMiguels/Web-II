import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ChevronDown, FileText, Sun, Moon } from 'lucide-react';
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar/Sidebar";

import logoDark from "@/assets/img/uru-logo-dark.png";
import logoWhite from "@/assets/img/uru-logo-white.png";

const Reports = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [periodos, setPeriodos] = useState([]);
  const [tiposReporte, setTiposReporte] = useState([]);

  const [formData, setFormData] = useState({
    periodo: '',
    fechaDesde: '',
    fechaHasta: '',
    tipoReporte: ''
  });

  useEffect(() => {
    // Simulacion de objetos de negocio desde el backend
    setPeriodos([
      { id: '1', nombre: '2026-A' },
      { id: '2', nombre: '2026-B' },
      { id: '3', nombre: '2026-C' }
    ]);

    setTiposReporte([
      { id: 'inv', nombre: 'Inventario de Equipos' },
      { id: 'pre', nombre: 'Historial de Préstamos' },
      { id: 'usu', nombre: 'Actividad de Usuarios' }
    ]);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0a0a0c] transition-colors duration-500 relative overflow-hidden font-sans">

    
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${theme === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
          backgroundSize: '45px 45px'
        }}
      />

      
      <div className="absolute top-6 right-6 md:top-8 md:right-10 z-50 flex items-center gap-4 md:gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f1115]/50 backdrop-blur-md h-10 w-10 hover:scale-105 transition-transform shadow-sm"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
        </Button>
        <img
          src={theme === "dark" ? logoDark : logoWhite}
          alt="URU Logo"
          className="w-28 md:w-32 h-auto object-contain transition-all duration-500 hidden md:block pointer-events-none"
        />
      </div>

      <Sidebar />
      
      <div className="flex-1 p-6 md:p-8 relative overflow-y-auto custom-scrollbar flex flex-col">

        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between mb-8 shrink-0 relative z-10 mt-2"
        >
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="h-16 w-16 rounded-[24px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <FileText size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Reportes
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                PANEL DE LA URU • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl mx-auto flex-1 flex justify-center items-center relative z-10 pb-8"
        >
          <div className="w-full max-w-lg bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md p-7 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 dark:text-white text-center mb-6 tracking-tight">
              Generar Reporte Personalizado
            </h2>

            <form className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">Período</label>
                <div className="relative">
                  <select
                    name="periodo"
                    value={formData.periodo}
                    onChange={handleChange}
                    className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-900 dark:text-white text-sm transition-all cursor-pointer"
                  >
                    <option value="" className="dark:bg-[#0a0a0c]">Seleccionar periodo...</option>
                    {periodos.map(p => (
                      <option key={p.id} value={p.id} className="dark:bg-[#0a0a0c]">{p.nombre}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">Desde</label>
                  <input
                    type="date"
                    name="fechaDesde"
                    onChange={handleChange}
                    className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white text-sm scheme-light dark:scheme-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">Hasta</label>
                  <input
                    type="date"
                    name="fechaHasta"
                    onChange={handleChange}
                    className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white text-sm scheme-light dark:scheme-dark"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">Tipo de Reporte</label>
                <div className="relative">
                  <select
                    name="tipoReporte"
                    value={formData.tipoReporte}
                    onChange={handleChange}
                    className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-900 dark:text-white text-sm transition-all cursor-pointer"
                  >
                    <option value="" className="dark:bg-[#0a0a0c]">Seleccionar categoría...</option>
                    {tiposReporte.map(t => (
                      <option key={t.id} value={t.id} className="dark:bg-[#0a0a0c]">{t.nombre}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <Button
                type="button" 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
              >
                Generar Documento
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;