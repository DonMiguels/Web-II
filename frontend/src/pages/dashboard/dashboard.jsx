import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Sun, Moon, User, Mail, IdCard } from "lucide-react";
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
  const userDisplayName = user?.name || user?.username || "Usuario";
  const userDisplayUsername = user?.username || "No disponible";
  const userDisplayEmail = user?.email || "No disponible";
  const userDisplayId = user?.id || "No disponible";
  const userDisplayCi = user?.ci || "No disponible";

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

          <div
            ref={contentRef}
            className="flex-1 overflow-y-scroll custom-scrollbar"
          >
            <AnimatePresence mode="wait">
              {isHome ? (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-h-full flex items-center justify-center px-1 py-2"
                >
                  <div className="relative w-full max-w-2xl overflow-hidden rounded-[34px] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0f1115]/90 shadow-xl">
                    <div className="p-7 md:p-9">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                            <User size={24} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                              Sesión iniciada
                            </p>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                              {userDisplayName}
                            </h3>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-widest">
                          <LayoutDashboard size={14} />
                          Activo
                        </div>
                      </div>

                      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Usuario
                          </p>
                          <p className="mt-1 text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200 break-all">
                            {userDisplayUsername}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            ID
                          </p>
                          <p className="mt-1 text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
                            {userDisplayId}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Mail size={12} /> Correo
                          </p>
                          <p className="mt-1 text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200 break-all">
                            {userDisplayEmail}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <IdCard size={12} /> Documento
                          </p>
                          <p className="mt-1 text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
                            {userDisplayCi}
                          </p>
                        </div>
                      </div>
                    </div>
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
