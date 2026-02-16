import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es obligatorio")
    .min(3, "Mínimo 3 caracteres"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "Debe tener al menos 6 caracteres"),
});
