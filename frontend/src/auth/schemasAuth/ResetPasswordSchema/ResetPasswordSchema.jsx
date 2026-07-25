import { z } from 'zod';
import { SecurityRules } from "@/service/securityService";

const specialCharRegex = /[^a-zA-Z0-9]/;

/**
 * Esquema Zod de validación del formulario de restablecimiento de contraseña.
 * Exige longitud mínima, un carácter especial, seguridad básica y coincidencia de confirmación.
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .min(6, 'Debe tener al menos 6 caracteres')
      .max(100, 'Contraseña demasiado larga')
      .regex(specialCharRegex, 'Debe contener al menos un caracter especial')
      .refine(SecurityRules.isSafe, {
        message: 'La contraseña contiene patrones o caracteres no permitidos',
      }),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });