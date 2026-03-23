import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LayoutDashboard,
  LogOut,
  Settings,
  Bell,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar, Inventory, Loan } from "@/components";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = () => {
    logout(navigate);
  };

  const getRouteConfig = () => {
    switch (location.pathname) {
      case "/inventory":
        return { title: "Inventario de Laboratorio", component: <Inventory /> };
      case "/loans":
        return { title: "Control de Préstamos", component: <Loan /> };
      case "/notifications":
        return {
          title: "Notificaciones",
          component: (
            <div className="rounded-[32px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f1115] p-8 shadow-sm">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                Notificaciones
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Sección en desarrollo.
              </p>
            </div>
          ),
        };
      default:
        return {
          title: `Bienvenido, ${user?.username || "Administrador"}`,
          component: null,
        };
    }
  };

  const { title, component } = getRouteConfig();
  const isHome = location.pathname === "/dashboard";

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0a0a0c] overflow-hidden">
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      <main className="flex-1 relative flex flex-col p-8 overflow-hidden z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col h-full"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {title}
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  URU •{" "}
                  {new Date().toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-blue-500/20 cursor-pointer"
              >
                <Bell size={20} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-blue-500/20 cursor-pointer"
              >
                <Settings size={20} />
              </Button>

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="rounded-xl font-bold flex items-center gap-2 px-6 shadow-lg shadow-red-500/10 cursor-pointer"
              >
                <LogOut size={18} /> Salir
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-[#0f1115] p-6 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
              <h3 className="text-sm font-black uppercase text-blue-500 mb-2 tracking-widest">
                Estado
              </h3>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                Sesión Activa
              </p>
            </div>

            <div className="bg-white dark:bg-[#0f1115] p-6 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
              <h3 className="text-sm font-black uppercase text-blue-500 mb-2 tracking-widest">
                Usuario ID
              </h3>
              <p className="text-2xl font-semibold italic text-slate-900 dark:text-white">
                #{user?.id || "001"}
              </p>
            </div>

            <div className="bg-white dark:bg-[#0f1115] p-6 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-center">
              <LayoutDashboard size={40} className="text-blue-500/40" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {isHome ? (
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div className="bg-white dark:bg-[#0f1115] p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
                    <Zap size={20} className="text-blue-500 mb-4" />
                    <h3 className="text-2xl font-bold dark:text-white">
                      Sistema Activo
                    </h3>
                    <p className="text-slate-500 text-sm mt-2">
                      ID Acceso: #{user?.id || "001"}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {component}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
