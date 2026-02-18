import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../AuthForm/AuthForm"; 
import { AlertMessage, NotificationToast } from "@/components"; 
import { forgotSchema } from "@/auth/schemasAuth/ForgotSchema/ForgotSchema"; 
import axios from "axios";

export const ForgotLayout = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" }); 
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/auth/forgot-password", { email: data.email });
      setSent(true);
    } catch (err) {
    
      setToast({
        show: true,
        message: "No se pudo conectar con el servidor o el correo no existe.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AlertMessage 
        type="success"
        title="Correo Enviado"
        message="Si el correo está registrado, recibirás un enlace de Resend pronto."
        buttonText="Ir al Login"
        onConfirm={() => navigate("/login")}
      />
    );
  }

  return (
    <>
      <AuthForm 
        title="Recuperar Clave"
        subtitle="Ingresa tu correo para enviarte un token"
        schema={forgotSchema} 
        fields={[{ name: "email", label: "Correo Electrónico", type: "email", placeholder: "tu@correo.com", icon: <Mail size={14}/> }]}
        onSubmit={onSubmit}
        submitText="Enviar Enlace"
        isLoading={loading}
        footer={
          <button type="button" onClick={() => navigate("/login")} className="w-full text-[10px] mt-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer bg-transparent border-none">
            <ArrowLeft size={12}/> Volver al Login
          </button>
        }
      />

      {toast.show && (
        <NotificationToast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
};