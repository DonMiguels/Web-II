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
      className="auth-container w-full max-w-[360px] rounded-[16px] p-6 text-center shadow-xl border border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex justify-center mb-4 text-green-500 dark:text-green-400"
        variants={iconVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative h-16 w-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full scale-125" />
          <CheckCircle2 size={56} strokeWidth={1.5} className="relative z-10" />
        </div>
      </motion.div>

      <h1 className="text-xl font-extrabold tracking-tight mb-2">
        ¡Todo listo!
      </h1>

      <p className="text-muted-foreground text-[11px] mb-6 px-2 font-medium opacity-80 leading-relaxed">
        Tu contraseña ha sido actualizada exitosamente. Ya puedes volver a
        entrar al sistema con tu nueva clave.
      </p>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button
          onClick={() => navigate("/login")}
          className="auth-submit-btn w-full h-9.5 rounded-lg font-bold text-white uppercase tracking-wider text-[10px] cursor-pointer shadow-md flex items-center justify-center gap-2 group"
        >
          Ir al Inicio de Sesión
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Button>
      </motion.div>
    </motion.div>
  );
};
