import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Portal que monta su contenido en `document.body` (útil para modales).
 *
 * @param {Object} props - Props del componente.
 * @param {React.ReactNode} props.children - Contenido a renderizar en el portal.
 * @returns {JSX.Element|null} Portal o `null` hasta montar en el cliente.
 */
export const ModalPortal = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
};
