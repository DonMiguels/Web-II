import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/hooks";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotificationToast } from "@/components";
import { loginSchema } from "@/auth/schemasAuth";

import "./AuthLayout.css";

export const AuthLayout = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const [toast, setToast] = useState({ message: "", type: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      setToast({ message: `Bienvenido, ${data.username}`, type: "success" });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
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
                Inicio de Sesión
              </h1>
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
                      className={`auth-input pl-10 h-12 rounded-xl relative z-0 ${errors.username ? "border-red-500" : ""}`}
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
              <motion.div variants={itemVariants}>
                <Field>
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel
                      htmlFor="password"
                      className="font-semibold opacity-90"
                    >
                      Contraseña
                    </FieldLabel>
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="px-0 h-auto text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={`auth-input pl-10 pr-10 h-12 rounded-xl relative z-0 ${errors.password ? "border-red-500" : ""}`}
                      placeholder="Ingresa tu contraseña"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none z-10"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] text-red-500 mt-1 ml-1 font-medium"
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
              disabled={isSubmitting || loading}
              className="auth-submit-btn w-full h-12 rounded-xl font-bold text-white uppercase tracking-wider text-sm cursor-pointer shadow-lg"
            >
              {loading ? "Validando..." : "Iniciar Sesión"}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </>
  );
};
