import { z } from "zod";


export const forgotSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
});


export const resetPasswordSchema = z.object({
  password: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});