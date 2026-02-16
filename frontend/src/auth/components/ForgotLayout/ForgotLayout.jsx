import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotSchema } from "@/auth/ForgotSchema/ForgotSchema";
import { ForgotSuccess } from "../ForgotSuccess/ForgotSuccess"; // Importamos el éxito
import "../AuthLayout/AuthLayout.css";

export const ForgotLayout = () => {
  const [isSuccess, setIsSuccess] = useState(false); 
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    console.log("Simulando envío a la DB de la URU:", data);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSuccess(true); 
  };

  if (isSuccess) return <ForgotSuccess />;

  const itemVariants = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } };

  return (
    <motion.div 
      className="auth-container" 
      initial="hidden" 
      animate="visible" 
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldSet>
          <motion.div className="auth-header" variants={itemVariants}>
            <h1 className="auth-title">Recuperar Acceso</h1>
          </motion.div>

          <FieldGroup className="space-y-4">
            {[
              { id: "username", label: "Usuario", type: "text", placeholder: "Ingresa tu usuario" },
              { id: "password", label: "Nueva Contraseña", type: "password", placeholder: "Ingresa tu nueva contraseña" },
              { id: "confirmPassword", label: "Confirmar Contraseña", type: "password", placeholder: "Confirma tu nueva contraseña" }
            ].map((f) => (
              <motion.div key={f.id} variants={itemVariants}>
                <Field>
                  <FieldLabel htmlFor={f.id} className="auth-label">{f.label}</FieldLabel>
                  <Input
                    id={f.id}
                    type={f.type}
                    className={`auth-input ${errors[f.id] ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : ""}`}
                    placeholder={f.placeholder}
                    {...register(f.id)}
                  />
                  <AnimatePresence mode="wait">
                    {errors[f.id] && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-600 mt-1 font-medium"
                      >
                        {errors[f.id].message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </Field>
              </motion.div>
            ))}
          </FieldGroup>
        </FieldSet>

        <motion.div className="mt-8 flex flex-col gap-4" variants={itemVariants}>
          <Button type="submit" disabled={isSubmitting} className="w-full auth-submit-btn font-semibold">
            {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
          <Button 
            variant="link" 
            type="button" 
            onClick={() => navigate("/login")} 
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Volver al Inicio de Sesión
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};