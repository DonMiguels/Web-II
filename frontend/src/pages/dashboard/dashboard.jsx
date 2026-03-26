import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Sun, Moon, Zap } from "lucide-react";
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar, Inventory, Loan } from "@/components";
import Notifications from "../notifications/notifications.jsx";
import Reports from "../reports/reportes.jsx";
import Permissions from "../settings/permission/permission.jsx";
import AssignProfile from "../settings/assignprofile/assignprofile.jsx";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname]);

  const getSettingsTitle = () => {
    if (location.pathname === "/settings/profiles") {
      return "CONFIGURACION - ASIGNAR PERFIL";
    }

    if (location.pathname === "/settings/permissions") {
      const hashTitleMap = {
        "#mantenimiento": "MANTENIMIENTO",
        "#persona": "PERSONA",
        "#usuario": "USUARIO",
        "#grupo": "GRUPO",
        "#perfil": "PERFIL",
        "#subsistema": "SUB-SISTEMA",
        "#clase": "CLASE",
        "#metodo": "METODO",
      };

      const sectionTitle = hashTitleMap[location.hash] || "ASIGNAR PERMISO";
      return `CONFIGURACION - ${sectionTitle}`;
    }

    return "CONFIGURACION";
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
          component: <Notifications embedded />,
        };
      case "/reports":
        return {
          title: "Reportes",
          component: <Reports embedded />,
        };
      case "/settings/permissions":
        return {
          title: getSettingsTitle(),
          component: <Permissions embedded />,
        };
      case "/settings/profiles":
        return {
          title: getSettingsTitle(),
          component: <AssignProfile embedded />,
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
    <div className="relative flex h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${theme === "dark" ? "#ffffff" : "#000000"} 1px, transparent 1px), linear-gradient(90deg, ${theme === "dark" ? "#ffffff" : "#000000"} 1px, transparent 1px)`,
          backgroundSize: "45px 45px",
        }}
      />
      <Sidebar />

      <main className="flex-1 relative flex flex-col p-8 overflow-hidden z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col h-full"
        >
          {
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 mt-2 md:mt-3 gap-4">
              <div>
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
              </div>
            </div>
          }

          {isHome && (
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
          )}

          <div
            ref={contentRef}
            className="flex-1 overflow-y-scroll custom-scrollbar"
          >
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
