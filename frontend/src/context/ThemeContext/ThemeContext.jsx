import { createContext, useContext, useEffect, useRef, useState } from "react";

const ThemeContext = createContext();

/**
 * Proveedor de tema claro/oscuro con persistencia en `localStorage`.
 *
 * @param {Object} props - Props del proveedor.
 * @param {React.ReactNode} props.children - Árbol de componentes hijos.
 * @returns {JSX.Element} Contexto de tema.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    root.classList.add("theme-transitioning");

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 380);

    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook para leer y alternar el tema actual.
 *
 * @returns {{theme: string, toggleTheme: Function}} Estado y acción de tema.
 */
export const useTheme = () => useContext(ThemeContext);
