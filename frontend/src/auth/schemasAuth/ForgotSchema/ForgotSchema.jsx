import { z } from "zod";

/**
 * Esquema Zod de validación del formulario de recuperación de contraseña.
 * Requiere un correo electrónico válido.
 */
export const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("El correo electrónico no es válido"),
});
