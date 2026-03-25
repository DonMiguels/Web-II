import { useEffect, useMemo } from "react";
import {
  Package,
  HandCoins,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  ArrowLeft,
  Shield,
  UserPlus,
  Wrench,
} from "lucide-react";
import { useAuth, useSidebar } from "@/context";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  children,
  isExpanded,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasChildren = Boolean(children?.length);
  const showChildren = hasChildren && isExpanded;

  const isChildActive = (childUrl) =>
    `${location.pathname}${location.hash}` === childUrl;

  return (
    <div className="flex flex-col w-full relative">
      <div
        onClick={onClick}
        className={`relative flex items-center h-12 mx-3 cursor-pointer transition-colors duration-200 group z-10 ${
          active
            ? "text-blue-600 dark:text-white"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        {active && (
          <motion.div
            layoutId="activeSidebarTab"
            className="absolute inset-0 bg-blue-50 dark:bg-white/10 rounded-md z-0"
          />
        )}
        <div className="w-12 h-12 flex items-center justify-center shrink-0 relative z-20">
          <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden flex-1 relative z-10"
            >
              <div className="w-[170px] flex items-center justify-between h-12 pr-2">
                <span className="font-semibold text-sm tracking-wide truncate">
                  {label}
                </span>
                {hasChildren && (
                  <ChevronDown
                    size={16}
                    className="transition-transform rotate-180"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showChildren && (
        <div className="flex flex-col gap-1 px-3 mt-1 overflow-hidden">
          {children.map((child) => (
            <div
              key={child.url}
              onClick={() => navigate(child.url)}
              className={`flex items-center h-10 pl-12 rounded-md cursor-pointer transition-all ${
                isChildActive(child.url)
                  ? "text-blue-600 dark:text-white font-bold bg-slate-50 dark:bg-white/5"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-medium"
              }`}
            >
              <span className="text-sm">{child.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SIDEBAR_LAST_MAIN_ROUTE_KEY = "uru-sidebar-last-main-route";

export const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, setIsExpanded } = useSidebar();
  const isSettingsMode = location.pathname.startsWith("/settings");

  const lastMainRoute =
    (typeof window !== "undefined" &&
      window.localStorage.getItem(SIDEBAR_LAST_MAIN_ROUTE_KEY)) ||
    "/dashboard";

  useEffect(() => {
    if (typeof window === "undefined" || isSettingsMode) {
      return;
    }

    window.localStorage.setItem(SIDEBAR_LAST_MAIN_ROUTE_KEY, location.pathname);
  }, [isSettingsMode, location.pathname]);

  const mainMenuConfig = useMemo(
    () => [
      { icon: Package, label: "Inventario", url: "/inventory" },
      { icon: HandCoins, label: "Préstamos", url: "/loans" },
      { icon: Bell, label: "Notificaciones", url: "/notifications" },
      { icon: BarChart3, label: "Reportes", url: "/reports" },
    ],
    [],
  );

  const settingsMenuConfig = useMemo(
    () => [
      { icon: Shield, label: "Asignar Permiso", url: "/settings/permissions" },
      { icon: UserPlus, label: "Asignar Perfil", url: "/settings/profiles" },
      {
        icon: Wrench,
        label: "Mantenimiento",
        url: "/settings/permissions#mantenimiento",
        children: [
          { title: "Persona", url: "/settings/permissions#persona" },
          { title: "Usuario", url: "/settings/permissions#usuario" },
          { title: "Grupo", url: "/settings/permissions#grupo" },
          { title: "Perfil", url: "/settings/permissions#perfil" },
          { title: "Sub-sistema", url: "/settings/permissions#subsistema" },
          { title: "Clase", url: "/settings/permissions#clase" },
          { title: "Método", url: "/settings/permissions#metodo" },
        ],
      },
    ],
    [],
  );

  const menuConfig = isSettingsMode ? settingsMenuConfig : mainMenuConfig;

  const checkActive = (item) => {
    if (item.url === "/settings/permissions") {
      return (
        location.pathname.startsWith("/settings/permissions") && !location.hash
      );
    }

    if (item.url === "/settings/permissions#mantenimiento") {
      return [
        "#persona",
        "#usuario",
        "#grupo",
        "#perfil",
        "#subsistema",
        "#clase",
        "#metodo",
      ].includes(location.hash);
    }

    return location.pathname === item.url;
  };

  const goToSettings = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        SIDEBAR_LAST_MAIN_ROUTE_KEY,
        location.pathname,
      );
    }

    setIsExpanded(true);
    navigate("/settings/permissions");
  };

  const goBackToMain = () => {
    setIsExpanded(true);
    navigate(lastMainRoute || "/dashboard");
  };

  return (
    <motion.aside
      animate={{ width: isExpanded ? 260 : 76 }}
      className="relative ml-4 my-4 h-[calc(100vh-32px)] rounded-3xl bg-white dark:bg-[#111216] border border-slate-200 dark:border-white/5 z-50 flex flex-col justify-between py-6 shadow-2xl shrink-0 overflow-hidden"
    >
      <div className="flex flex-col gap-6 w-full">
        <div className="px-3 shrink-0">
          <div
            onClick={() => setIsExpanded((value) => !value)}
            className="relative flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl h-14 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-4 text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-white"
                >
                  {isSettingsMode ? "Configuración" : "Tablero"}
                </motion.span>
              )}
            </AnimatePresence>
            <div
              className={`flex items-center justify-center w-12 h-12 ${
                isExpanded ? "ml-auto mr-1" : "mx-auto"
              }`}
            >
              {isExpanded ? (
                <X size={20} className="text-slate-500" />
              ) : (
                <Menu size={22} className="text-slate-500" />
              )}
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 w-full">
          {menuConfig.map((item) => (
            <SidebarItem
              key={item.url}
              {...item}
              onClick={() => navigate(item.url)}
              active={checkActive(item)}
              isExpanded={isExpanded}
            />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-2 w-full mb-2 shrink-0 pt-4 bg-white dark:bg-[#111216] z-10">
        <div className="h-[1px] bg-slate-200 dark:bg-white/5 w-full mb-2" />
        {isSettingsMode ? (
          <SidebarItem
            icon={ArrowLeft}
            label="Volver"
            isExpanded={isExpanded}
            onClick={goBackToMain}
          />
        ) : (
          <SidebarItem
            icon={Settings}
            label="Configuración"
            isExpanded={isExpanded}
            active={location.pathname.startsWith("/settings")}
            onClick={goToSettings}
          />
        )}
        <SidebarItem
          icon={LogOut}
          label="Cerrar Sesión"
          isExpanded={isExpanded}
          onClick={() => logout(navigate)}
        />
      </div>
    </motion.aside>
  );
};
