import { z } from "zod";

export const forgotSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es obligatorio")
    .min(3, "Mínimo 3 caracteres"),
  password: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});