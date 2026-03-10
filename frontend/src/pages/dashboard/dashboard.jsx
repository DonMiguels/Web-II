import { useAuth, useTheme } from "@/context";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, LogOut, Sun, Moon, LayoutDashboard } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar/Sidebar"; 

import logoDark from "@/assets/img/uru-logo-dark.png"; 
import logoWhite from "@/assets/img/uru-logo-white.png";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#0a0a0c] transition-colors duration-500 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
        style={{ 
          backgroundImage: `linear-gradient(${theme === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
          backgroundSize: '45px 45px' 
        }} 
      />

      <div className="absolute top-8 right-10 z-50 pointer-events-none">
        <img 
          src={theme === "dark" ? logoDark : logoWhite} 
          alt="URU Logo" 
          className="w-32 h-auto object-contain transition-all duration-500"
        />
      </div>

      <Sidebar />

      <div className="flex-1 p-8 relative flex flex-col items-center justify-center">

        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-5xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-[28px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <User size={40} className="text-white" />
              </div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-black tracking-tight text-slate-900 dark:text-white"
                >
                  Bienvenido,{" "}
                  <span className="text-blue-600">
                    {user?.username}
                  </span>
                </motion.h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
                  Panel de la URU • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1115] cursor-pointer h-12 w-12 hover:scale-105 transition-transform"
              >
                {theme === "light" ? <Moon size={22} /> : <Sun size={22} className="text-yellow-400" />}
              </Button>

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="rounded-2xl font-bold flex items-center gap-2 px-8 h-12 shadow-lg shadow-red-500/10 cursor-pointer hover:scale-105 transition-transform bg-[#ff5f5f] hover:bg-red-600 text-white"
              >
                <LogOut size={20} /> Salir
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm transition-all duration-300 hover:border-blue-500/30">
              <h3 className="text-xs font-black uppercase text-blue-500 mb-3 tracking-widest">
                Estado
              </h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                Sesión Activa
              </p>
            </div>

            <div className="bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm transition-all duration-300 hover:border-blue-500/30">
              <h3 className="text-xs font-black uppercase text-blue-500 mb-3 tracking-widest">
                Usuario ID
              </h3>
              <p className="text-3xl font-bold italic text-slate-900 dark:text-white">
                #{user?.id}
              </p>
            </div>

            <div className="bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-center transition-all duration-300 hover:border-blue-500/30">
              <LayoutDashboard size={48} className="text-blue-600/20" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};