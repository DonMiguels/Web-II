import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Etiqueta de formulario basada en Radix Label.
 *
 * @param {Object} props - Props del componente.
 * @param {string} [props.className] - Clases CSS adicionales.
 * @param {React.Ref} ref - Referencia al elemento raíz.
 * @returns {JSX.Element} Label accesible.
 */
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

/**
 * Exporta el componente `Label`.
 */
export { Label }
