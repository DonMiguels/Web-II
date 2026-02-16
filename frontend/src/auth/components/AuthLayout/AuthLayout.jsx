import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/auth/LoginSchema/LoginSchema";
import "./AuthLayout.css";

export const AuthLayout = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    console.log("Datos del formulario:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

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
    <motion.div
      className="auth-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldSet>
          <motion.div className="auth-header" variants={itemVariants}>
            <h1 className="auth-title">Inicio de Sesión</h1>
          </motion.div>

          <FieldGroup className="space-y-4">
            <motion.div variants={itemVariants}>
              <Field>
                <FieldLabel htmlFor="username" className="auth-label">
                  Usuario
                </FieldLabel>
                <Input
                  id="username"
                  className={`auth-input ${errors.username ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : ""}`}
                  autoComplete="off"
                  placeholder="Ingresa tu usuario"
                  {...register("username")}
                />
                <AnimatePresence>
                  {errors.username && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-600 mt-1 font-medium"
                    >
                      {errors.username.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </Field>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Button
                     variant="link"
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="px-0 h-auto text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors hover:cursor-pointer"
                    > 
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  className={`auth-input ${errors.password ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : ""}`}
                  autoComplete="off"
                  placeholder="Ingresa tu contraseña"
                  {...register("password")}
                />
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-600 mt-1 font-medium"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </Field>
            </motion.div>
          </FieldGroup>
        </FieldSet>

        <motion.div className="mt-8" variants={itemVariants}>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full auth-submit-btn font-semibold hover:cursor-pointer transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]"
          >
            {isSubmitting ? "Validando..." : "Iniciar Sesión"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
