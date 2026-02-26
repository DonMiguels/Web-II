import { useState } from "react";
import { ChevronRight, ChevronLeft, Package, HandCoins, BarChart3, Settings, LogOut, User, Search, ChevronDown } from "lucide-react";
import { useAuth, useTheme } from "@/context"; 
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SidebarItem = ({ icon: Icon, label, active, onClick, children, isExpanded, setExpanded }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const hasChildren = children && children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      if (!isExpanded) {
        setExpanded(true); 
        setIsSubmenuOpen(true);
      } else {
        setIsSubmenuOpen(!isSubmenuOpen);
      }
    } else {
      onClick?.();
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      <div 
        onClick={handleClick}
        title={!isExpanded ? label : undefined}
        className={`relative flex items-center h-12 mx-3 rounded-xl cursor-pointer transition-colors duration-200 group z-10
          ${active 
            ? "text-blue-600 dark:text-white" 
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
      >
        {active && (
          <motion.div 
            layoutId="leftIndicator" 
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-md z-20" 
          />
        )}

        {active && (
          <motion.div 
            layoutId="activeSidebarTab" 
            className="absolute inset-0 bg-blue-50 dark:bg-white/10 rounded-xl z-0" 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                    className={`shrink-0 transition-transform duration-300 ${isSubmenuOpen ? "rotate-180" : ""}`} 
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
            {children.map((child, idx) => (
              <div
                key={idx}
                onClick={() => onClick?.(child.url)}
                className="flex items-center h-10 pl-12 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-all"
              >
                <span className="text-sm font-medium">{child.title}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuConfig = [
    {
      icon: User,
      label: "Usuarios",
      children: [
        { title: "Crear", url: "/usuarios/crear" },
        { title: "Lista", url: "/usuarios/lista" }
      ]
    },
    {
      icon: Package,
      label: "Inventario",
      children: [
        { title: "Productos", url: "/inventario/productos" },
        { title: "Stock", url: "/inventario/stock" }
      ]
    },
    { icon: HandCoins, label: "Préstamos", url: "/prestamos" },
    { icon: BarChart3, label: "Reportes", url: "/dashboard" }
  ];

  const checkActive = (item) => {
    if (item.url) return location.pathname === item.url || location.pathname.startsWith(item.url + '/');
    return location.pathname.includes(item.label.toLowerCase());
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 260 : 76 }}
      className="fixed left-4 top-4 h-[calc(100vh-32px)] rounded-3xl bg-white dark:bg-[#111216] border border-slate-200 dark:border-white/5 z-50 flex flex-col justify-between py-6 shadow-2xl transition-colors duration-500"
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#2B2D31] text-slate-800 dark:text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer border border-slate-200 dark:border-white/10 z-50"
      >
        {isExpanded ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
      </button>

      <div className="flex flex-col gap-6 w-full">
        <div className="px-3 mt-2">
          <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl h-10 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <Search size={18} className="text-slate-500 dark:text-slate-400" />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }} 
                  animate={{ width: "auto", opacity: 1 }} 
                  exit={{ width: 0, opacity: 0 }} 
                  className="overflow-hidden"
                >
                  <div className="w-[160px] flex items-center h-10">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Buscar...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex flex-col gap-2 w-full mt-2">
          {menuConfig.map((item, index) => (
            <SidebarItem 
              key={index}
              {...item}
              onClick={(url) => url ? navigate(url) : navigate(`/${item.label.toLowerCase()}`)}
              active={checkActive(item)}
              isExpanded={isExpanded}
              setExpanded={setIsExpanded}
            />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-2 w-full mb-2">
        <div className="h-[1px] bg-slate-200 dark:bg-white/5 w-full mb-2" />
        <SidebarItem icon={Settings} label="Configuración" isExpanded={isExpanded} setExpanded={setIsExpanded} onClick={() => navigate('/settings')} />
        <SidebarItem icon={LogOut} label="Cerrar Sesión" isExpanded={isExpanded} setExpanded={setIsExpanded} onClick={() => logout(navigate)} />
      </div>
    </motion.aside>
  );
};