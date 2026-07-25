import { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext(null);
const SIDEBAR_STATE_KEY = "uru-sidebar-expanded";

/**
 * Proveedor del estado expandido/colapsado del sidebar, persistido en `localStorage`.
 *
 * @param {Object} props - Props del proveedor.
 * @param {React.ReactNode} props.children - Árbol de componentes hijos.
 * @returns {JSX.Element} Contexto del sidebar.
 */
export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_STATE_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SIDEBAR_STATE_KEY, String(isExpanded));
  }, [isExpanded]);

  const toggleSidebar = () => setIsExpanded((value) => !value);

  return (
    <SidebarContext.Provider
      value={{ isExpanded, setIsExpanded, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Hook para acceder al estado y acciones del sidebar.
 *
 * @returns {{isExpanded: boolean, setIsExpanded: Function, toggleSidebar: Function}|null}
 * Contexto del sidebar.
 */
export const useSidebar = () => useContext(SidebarContext);
