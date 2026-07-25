import { AuthLayout } from "@/auth/componentsAuth";

/**
 * Contenedor del formulario de inicio de sesión.
 * Centra el `AuthLayout` a pantalla completa.
 *
 * @returns {JSX.Element} Vista de login.
 */
export const LoginForm = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <AuthLayout />
    </div>
  );
};
