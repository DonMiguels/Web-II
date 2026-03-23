import { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  children,
  isExpanded,
  setExpanded,
}) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const hasChildren = children && children.length > 0;
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (hasChildren) {
      if (!isExpanded) {
        setExpanded(true);
        setIsSubmenuOpen(true);
      } else {
        setIsSubmenuOpen(!isSubmenuOpen);
      }
      return;
    }

    onClick?.();
  };

  return (
    <div className="flex flex-col w-full relative">
      <div
        onClick={handleClick}
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
                    className={`transition-transform ${isSubmenuOpen ? "rotate-180" : ""}`}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isExpanded && isSubmenuOpen && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-1 px-3 mt-1 overflow-hidden"
          >
            {children.map((child, idx) => {
              const isChildActive = location.pathname === child.url;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(child.url)}
                  className={`flex items-center h-10 pl-12 rounded-md cursor-pointer transition-all ${
                    isChildActive
                      ? "text-blue-600 dark:text-white font-bold bg-slate-50 dark:bg-white/5"
                      : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-medium"
                  }`}
                >
                  <span className="text-sm">{child.title}</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuConfig = [
    { icon: Package, label: "Inventario", url: "/inventory" },
    { icon: HandCoins, label: "Préstamos", url: "/loans" },
    { icon: Bell, label: "Notificaciones", url: "/notifications" },
    { icon: BarChart3, label: "Reportes", url: "/dashboard" },
  ];

  const checkActive = (item) => location.pathname === item.url;

  return (
    <motion.aside
      animate={{ width: isExpanded ? 260 : 76 }}
      className="relative ml-4 my-4 h-[calc(100vh-32px)] rounded-3xl bg-white dark:bg-[#111216] border border-slate-200 dark:border-white/5 z-50 flex flex-col justify-between py-6 shadow-2xl shrink-0 overflow-hidden"
    >
      <div className="flex flex-col gap-6 w-full">
        <div className="px-3 shrink-0">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
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
                  Tablero
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
          {menuConfig.map((item, index) => (
            <SidebarItem
              key={index}
              {...item}
              onClick={() => navigate(item.url)}
              active={checkActive(item)}
              isExpanded={isExpanded}
              setExpanded={setIsExpanded}
            />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-2 w-full mb-2 shrink-0 pt-4 bg-white dark:bg-[#111216] z-10">
        <div className="h-[1px] bg-slate-200 dark:bg-white/5 w-full mb-2" />
        <SidebarItem
          icon={Settings}
          label="Configuración"
          isExpanded={isExpanded}
          setExpanded={setIsExpanded}
          active={location.pathname.startsWith("/settings")}
          onClick={() => navigate("/settings")}
        />
        <SidebarItem
          icon={LogOut}
          label="Cerrar Sesión"
          isExpanded={isExpanded}
          setExpanded={setIsExpanded}
          onClick={() => logout(navigate)}
        />
      </div>
    </motion.aside>
  );
};
