import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Bell, ChevronDown, Sun, Moon, ChevronsRight, ChevronsLeft } from 'lucide-react'; 
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar/Sidebar"; 

import logoDark from "@/assets/img/uru-logo-dark.png"; 
import logoWhite from "@/assets/img/uru-logo-white.png";

const Notifications = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [group, setGroup] = useState('');
  const [message, setMessage] = useState('');

  const [users, setUsers] = useState([]);
  const [notifiedUsers, setNotifiedUsers] = useState([]);
  
  const [checkedUsers, setCheckedUsers] = useState([]);
  const [checkedNotifiedUsers, setCheckedNotifiedUsers] = useState([]);

  //Prueba
  useEffect(() => {
    const mockUsers = [
      { id: 1, name: 'Carlos López', role: 'Profesor' },
      { id: 2, name: 'María Fernández', role: 'Estudiante' },
      { id: 3, name: 'Laura Gómez', role: 'Estudiante' },
      { id: 4, name: 'José Martínez', role: 'Administrativo' },
      { id: 5, name: 'Ana García', role: 'Estudiante' },
    ];
    setUsers(mockUsers);
    setNotifiedUsers([]);
    setCheckedUsers([]);
    setCheckedNotifiedUsers([]);
  }, [group]);

  const toggleCheck = (id, listType) => {
    if (listType === 'users') {
      setCheckedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setCheckedNotifiedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  const moveRight = (e) => {
    e.preventDefault();
    const itemsToMove = users.filter(u => checkedUsers.includes(u.id));
    setNotifiedUsers([...notifiedUsers, ...itemsToMove]);
    setUsers(users.filter(u => !checkedUsers.includes(u.id)));
    setCheckedUsers([]);
  };

  const moveLeft = (e) => {
    e.preventDefault();
    const itemsToMove = notifiedUsers.filter(u => checkedNotifiedUsers.includes(u.id));
    setUsers([...users, ...itemsToMove]);
    setNotifiedUsers(notifiedUsers.filter(u => !checkedNotifiedUsers.includes(u.id)));
    setCheckedNotifiedUsers([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Notificando a:", notifiedUsers);
    console.log("Mensaje:", message);
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
              <Bell size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Notificaciones
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
          <div className="w-full max-w-2xl bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md p-6 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-2xl">
            
            <h2 className="text-lg font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Generar Notificación
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">Seleccionar Grupo</label>
                <div className="relative">
                  <select 
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-900 dark:text-white text-sm transition-all cursor-pointer"
                  >
                    <option value="" className="dark:bg-[#0a0a0c]">Todos los usuarios...</option>
                    <option value="estudiantes" className="dark:bg-[#0a0a0c]">Estudiantes</option>
                    <option value="profesores" className="dark:bg-[#0a0a0c]">Profesores</option>
                    <option value="administrativos" className="dark:bg-[#0a0a0c]">Administrativos</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-1 tracking-widest text-center block">Usuarios</label>
                  <div className="h-28 overflow-y-auto bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2 custom-scrollbar">
                    {users.length === 0 ? (
                      <p className="text-[10px] text-center text-slate-400 mt-10 italic">No hay usuarios</p>
                    ) : (
                      users.map(u => (
                        <div key={u.id} onClick={() => toggleCheck(u.id, 'users')} className="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-colors mb-0.5 border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                          <input type="checkbox" checked={checkedUsers.includes(u.id)} readOnly className="accent-blue-600 w-3.5 h-3.5 cursor-pointer" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{u.name}</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">{u.role}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Button onClick={moveRight} disabled={checkedUsers.length === 0} variant="outline" className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] hover:border-blue-500 hover:text-blue-500 disabled:opacity-40 transition-colors">
                    <ChevronsRight size={16} />
                  </Button>
                  <Button onClick={moveLeft} disabled={checkedNotifiedUsers.length === 0} variant="outline" className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] hover:border-slate-400 hover:text-slate-400 disabled:opacity-40 transition-colors">
                    <ChevronsLeft size={16} />
                  </Button>
                </div>

                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-1 tracking-widest text-center block">Notificados</label>
                  <div className="h-28 overflow-y-auto bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2 custom-scrollbar">
                    {notifiedUsers.length === 0 ? (
                      <p className="text-[10px] text-center text-slate-400 mt-10 italic">Selecciona usuarios</p>
                    ) : (
                      notifiedUsers.map(u => (
                        <div key={u.id} onClick={() => toggleCheck(u.id, 'notifiedUsers')} className="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-colors mb-0.5 border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                          <input type="checkbox" checked={checkedNotifiedUsers.includes(u.id)} readOnly className="accent-slate-500 w-3.5 h-3.5 cursor-pointer" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{u.name}</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">{u.role}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">Mensaje</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe los detalles de la notificación aquí..."
                  className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white text-sm resize-none h-16 transition-all custom-scrollbar placeholder:text-slate-400"
                />
              </div>

              <Button 
                type="submit"
                disabled={notifiedUsers.length === 0 || message.trim() === ''}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest text-[11px] disabled:opacity-50 disabled:active:scale-100"
              >
                Enviar Notificación
              </Button>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;