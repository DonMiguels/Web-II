/**
 * Punto de entrada de la aplicación React.
 * Monta el árbol con StrictMode, BrowserRouter y ThemeProvider.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/context";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./app/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
