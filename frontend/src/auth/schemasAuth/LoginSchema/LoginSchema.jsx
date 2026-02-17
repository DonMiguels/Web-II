import { z } from "zod";

const safeUsernameRegex = /^[a-zA-Z0-9._]+$/;

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es obligatorio")
    .min(3, "Mínimo 3 caracteres")
    .max(20, "El usuario es demasiado largo")
    .trim()
    .regex(
      safeUsernameRegex,
      "El usuario solo puede contener letras, números, puntos y guiones bajos",
    ),

  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "Debe tener al menos 6 caracteres")
    .max(100, "Contraseña demasiado larga")
    .refine((val) => !val.includes("<script"), {
      message: "La contraseña contiene caracteres no permitidos",
    }),
});
