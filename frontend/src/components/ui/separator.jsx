"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Separador visual horizontal o vertical (Radix Separator).
 *
 * @param {Object} props - Props del componente.
 * @param {string} [props.className] - Clases CSS adicionales.
 * @param {"horizontal"|"vertical"} [props.orientation="horizontal"] - Orientación.
 * @param {boolean} [props.decorative=true] - Si es decorativo para accesibilidad.
 * @param {React.Ref} ref - Referencia al elemento raíz.
 * @returns {JSX.Element} Separador.
 */
const Separator = React.forwardRef((
  { className, orientation = "horizontal", decorative = true, ...props },
  ref
) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props} />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

/**
 * Exporta el componente `Separator`.
 */
export { Separator }
