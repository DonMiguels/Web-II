import { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext(null);
const SIDEBAR_STATE_KEY = "uru-sidebar-expanded";

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

export const useSidebar = () => useContext(SidebarContext);
