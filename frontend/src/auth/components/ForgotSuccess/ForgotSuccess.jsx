import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react"; 
import "../AuthLayout/AuthLayout.css";

export const ForgotSuccess = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="auth-container text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-center mb-6 text-green-500">
        <CheckCircle2 size={64} strokeWidth={1.5} />
      </div>
      
      <h1 className="auth-title mb-2">¡Todo listo!</h1>
      <p className="auth-subtitle mb-8 px-4">
        Tu contraseña ha sido actualizada exitosamente. Ya puedes volver a entrar al sistema con tu nueva clave.
      </p>

      <Button 
        onClick={() => navigate("/login")}
        className="w-full auth-submit-btn font-semibold hover:cursor-pointer"
      >
        Ir al Inicio de Sesión
      </Button>
    </motion.div>
  );
};