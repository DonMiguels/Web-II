import { z } from 'zod';

const specialCharRegex = /[^a-zA-Z0-9]/;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .min(6, 'Debe tener al menos 6 caracteres')
      .max(100, 'Contraseña demasiado larga')
      .regex(specialCharRegex, 'Debe contener al menos un caracter especial')
      .refine((val) => !val.includes('<script'), {
        message: 'La contraseña contiene caracteres no permitidos',
      }),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
