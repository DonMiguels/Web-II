import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ArrowLeft } from "lucide-react";

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotificationToast } from "@/components";
import { forgotSchema } from "@/auth/schemasAuth";
import { ForgotSuccess } from "@/auth/componentsAuth";

export const ForgotLayout = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setToast({
        message: "Contraseña actualizada correctamente",
        type: "success",
      });

      setTimeout(() => setIsSuccess(true), 1200);
    } catch (err) {
      setToast({
        message: err.message || "Error al intentar actualizar la contraseña",
        type: "error",
      });
    }
  };

  if (isSuccess) return <ForgotSuccess />;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <>
      <NotificationToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <motion.div
        className="auth-container w-full max-w-[440px] rounded-[28px] p-8 sm:p-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <motion.div className="text-center mb-8" variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Recuperar Acceso
              </h1>
              <p className="text-muted-foreground text-sm mt-2 font-medium opacity-80">
                Configura tu nueva contraseña
              </p>
            </motion.div>

            <FieldGroup className="space-y-5">
              <motion.div variants={itemVariants}>
                <Field>
                  <FieldLabel
                    htmlFor="username"
                    className="font-semibold mb-1.5 block opacity-90"
                  >
                    Usuario
                  </FieldLabel>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input
                      id="username"
                      className={`auth-input pl-10 h-12 rounded-xl relative z-0 ${errors.username ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : ""}`}
                      placeholder="Ingresa tu usuario"
                      {...register("username")}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.username && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] text-red-500 mt-1 ml-1 font-medium"
                      >
                        {errors.username.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </Field>
              </motion.div>

              {[
                {
                  id: "password",
                  label: "Nueva Contraseña",
                  icon: <Lock className="h-4 w-4" />,
                },
                {
                  id: "confirmPassword",
                  label: "Confirmar Contraseña",
                  icon: <Lock className="h-4 w-4" />,
                },
              ].map((f) => (
                <motion.div key={f.id} variants={itemVariants}>
                  <Field>
                    <FieldLabel
                      htmlFor={f.id}
                      className="font-semibold mb-1.5 block opacity-90"
                    >
                      {f.label}
                    </FieldLabel>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
                        {f.icon}
                      </div>
                      <Input
                        id={f.id}
                        type="password"
                        className={`auth-input pl-10 h-12 rounded-xl relative z-0 ${errors[f.id] ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : ""}`}
                        placeholder="••••••••"
                        {...register(f.id)}
                      />
                    </div>
                    <AnimatePresence>
                      {errors[f.id] && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[11px] text-red-500 mt-1 ml-1 font-medium"
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

          <motion.div
            className="mt-8 flex flex-col gap-4"
            variants={itemVariants}
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="auth-submit-btn w-full h-12 rounded-xl font-bold text-white uppercase tracking-wider text-sm cursor-pointer shadow-lg"
            >
              {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>

            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Volver al Inicio de Sesión
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </>
  );
};
