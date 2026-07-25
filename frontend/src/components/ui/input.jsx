import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Campo de entrada de texto estilizado.
 *
 * @param {Object} props - Props del componente.
 * @param {string} [props.className] - Clases CSS adicionales.
 * @param {string} [props.type] - Tipo HTML del input.
 * @param {React.Ref} ref - Referencia al elemento `<input>`.
 * @returns {JSX.Element} Input estilizado.
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

/**
 * Exporta el componente `Input`.
 */
export { Input }
