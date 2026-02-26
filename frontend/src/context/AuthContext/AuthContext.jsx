import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  withCredentials: true,
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await api.get("/me");
      if (res.data.loggedIn) {
        setUser(res.data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.includes(window.location.pathname);

    if (!isPublicRoute) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await api.post("/login", credentials);
      if (res.data.user) {
        setUser(res.data.user);
        return res.data;
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Error en la autenticación";
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async (navigate) => {
    try {
      setUser(null);
      await api.post("/logout");

      if (navigate) {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const forgotPassword = async ({ email }) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await api.post("/forgot-password", { email });
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Error al enviar el correo de recuperación";
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async ({ token, password, confirmPassword }) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await api.post("/reset-password", {
        token,
        password,
        confirmPassword,
      });
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Error al restablecer la contraseña";
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSubmitting,
        authError,
        login,
        logout,
        forgotPassword,
        resetPassword,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};