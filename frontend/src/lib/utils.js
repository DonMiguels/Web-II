import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de CSS con `clsx` y resuelve conflictos de Tailwind con `twMerge`.
 *
 * @param {...*} inputs - Clases, objetos o arrays compatibles con clsx.
 * @returns {string} Cadena de clases CSS fusionada.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
