import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Settings, ChevronDown, Sun, Moon, Shield } from 'lucide-react'; 
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar/Sidebar"; 

import logoDark from "@/assets/img/uru-logo-dark.png"; 
import logoWhite from "@/assets/img/uru-logo-white.png";

const Permissions = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState('');
  const [subSystem, setSubSystem] = useState('');
  const [moduleClass, setModuleClass] = useState('');

  // Prueba
  const [permissions, setPermissions] = useState([
    { id: '1', name: 'createUser', description: 'Permite la creación de nuevos usuarios en el sistema.', checked: true },
    { id: '2', name: 'findUser', description: 'Permite la búsqueda y lectura de la información de los usuarios.', checked: true },
    { id: '3', name: 'deleteUser', description: 'Permite eliminar usuarios existentes de la base de datos.', checked: false },
    { id: '4', name: 'updateUser', description: 'Permite modificar la información y datos de usuarios existentes.', checked: false },
    { id: '5', name: 'assignRole', description: 'Permite asignar o remover roles a los usuarios.', checked: false },
    { id: '6', name: 'resetPassword', description: 'Permite reiniciar la contraseña de un usuario.', checked: false },
    { id: '7', name: 'exportUsers', description: 'Permite exportar la lista de usuarios en formato Excel o CSV.', checked: false },
  ]);

  const togglePermission = (id) => {
    setPermissions(permissions.map(perm => 
      perm.id === id ? { ...perm, checked: !perm.checked } : perm
    ));
  };

  const handleAssign = (e) => {
    e.preventDefault();
    const assignedPermissions = permissions.filter(p => p.checked);
    console.log("Asignando al perfil:", profile);
    console.log("Permisos asignados:", assignedPermissions);
  };

  const selectedCount = permissions.filter(p => p.checked).length;

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

     
      <div className="flex-1 p-6 md:p-8 relative overflow-hidden flex flex-col h-screen pl-24 md:pl-28">
        
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

       
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between mb-4 md:mb-6 shrink-0 relative z-10"
        >
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-[24px] bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shadow-lg shadow-slate-900/20 shrink-0">
              <Settings size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Configuración
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-1">
                GESTIÓN DE PERMISOS • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-6xl mx-auto flex-1 flex flex-col relative z-10 pb-4 h-full min-h-0"
        >
          <div className="w-full flex flex-col bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md p-6 md:p-8 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-2xl h-full min-h-0">
            
            <div className="flex items-center gap-3 mb-6 shrink-0">
              <Shield className="text-blue-500" size={24} />
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Asignar Permisos
              </h2>
            </div>
            
            <form onSubmit={handleAssign} className="flex flex-col flex-1 h-full min-h-0 gap-6">

              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 shrink-0">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">Seleccionar Perfil</label>
                  <div className="relative">
                    <select 
                      value={profile}
                      onChange={(e) => setProfile(e.target.value)}
                      className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-900 dark:text-white text-sm transition-all cursor-pointer"
                    >
                      <option value="" className="dark:bg-[#0a0a0c]">Seleccionar...</option>
                      <option value="administrador" className="dark:bg-[#0a0a0c]">Administrador</option>
                      <option value="profesor" className="dark:bg-[#0a0a0c]">Profesor</option>
                      <option value="estudiante" className="dark:bg-[#0a0a0c]">Estudiante</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">Sub-Sistema</label>
                  <div className="relative">
                    <select 
                      value={subSystem}
                      onChange={(e) => setSubSystem(e.target.value)}
                      className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-900 dark:text-white text-sm transition-all cursor-pointer"
                    >
                      <option value="" className="dark:bg-[#0a0a0c]">Seleccionar...</option>
                      <option value="Equipo" className="dark:bg-[#0a0a0c]">Académico</option>
                      <option value="Persona" className="dark:bg-[#0a0a0c]">Administrativo</option>
                      <option value="Prestamos" className="dark:bg-[#0a0a0c]">Recursos Humanos</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">Clases</label>
                  <div className="relative">
                    <select 
                      value={moduleClass}
                      onChange={(e) => setModuleClass(e.target.value)}
                      className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-900 dark:text-white text-sm transition-all cursor-pointer"
                    >
                      <option value="" className="dark:bg-[#0a0a0c]">Seleccionar...</option>
                      <option value="usuarios" className="dark:bg-[#0a0a0c]">Usuarios</option>
                      <option value="reportes" className="dark:bg-[#0a0a0c]">Reportes</option>
                      <option value="notificaciones" className="dark:bg-[#0a0a0c]">Notificaciones</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
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
                
                
                <div className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map((perm) => (
                      <div 
                        key={perm.id} 
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                          perm.checked 
                            ? 'bg-white dark:bg-[#1a1d24] border-blue-500/30 shadow-sm' 
                            : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10'
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
                          <p className={`text-sm font-bold truncate mb-1 ${perm.checked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
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
                  disabled={!profile || !subSystem || !moduleClass || selectedCount === 0}
                  className="w-full md:w-auto md:ml-auto md:min-w-[200px] flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest text-[11px] disabled:opacity-50 disabled:active:scale-100"
                >
                  Guardar Permisos
                </Button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Permissions;