import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const ForgotSuccess = () => {
  const navigate = useNavigate();

  const iconVariants = {
    hidden: { scale: 0, rotate: -45 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="auth-container w-full max-w-[440px] rounded-[28px] p-8 sm:p-10 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex justify-center mb-6 text-green-500 dark:text-green-400"
        variants={iconVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150" />
          <CheckCircle2 size={80} strokeWidth={1.5} className="relative z-10" />
        </div>
      </motion.div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
        ¡Todo listo!
      </h1>

      <p className="text-muted-foreground text-sm mb-8 px-4 font-medium opacity-80 leading-relaxed">
        Tu contraseña ha sido actualizada exitosamente. Ya puedes volver a
        entrar al sistema con tu nueva clave.
      </p>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => navigate("/login")}
          className="auth-submit-btn w-full h-12 rounded-xl font-bold text-white uppercase tracking-wider text-sm cursor-pointer shadow-lg flex items-center justify-center gap-2 group"
        >
          Ir al Inicio de Sesión
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Button>
      </motion.div>
    </motion.div>
  );
};
