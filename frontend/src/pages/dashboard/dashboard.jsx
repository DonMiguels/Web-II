import { useAuth, useTheme } from "@/context";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  LayoutDashboard,
  LogOut,
  Settings,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[var(--bg-main)] transition-colors duration-500">
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Bienvenido,{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  {user?.username}
                </span>
              </h1>
              <p className="text-muted-foreground font-medium">
                Panel de la URU • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl border-blue-500/20 cursor-pointer"
            >
              {theme === "light" ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} className="text-yellow-400" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-blue-500/20 cursor-pointer"
            >
              <Bell size={20} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-blue-500/20 cursor-pointer"
            >
              <Settings size={20} />
            </Button>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="rounded-xl font-bold flex items-center gap-2 px-6 shadow-lg shadow-red-500/10 cursor-pointer"
            >
              <LogOut size={18} /> Salir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="auth-container p-6 rounded-[24px] border border-blue-500/10 bg-white/5 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase text-blue-500 mb-2">
              Estado
            </h3>
            <p className="text-2xl font-semibold text-[var(--text-primary)]">
              Sesión Activa
            </p>
          </div>

          <div className="auth-container p-6 rounded-[24px] border border-blue-500/10 bg-white/5 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase text-blue-500 mb-2">
              Usuario ID
            </h3>
            <p className="text-2xl font-semibold italic text-[var(--text-primary)]">
              #{user?.id}
            </p>
          </div>

          <div className="auth-container p-6 rounded-[24px] border border-blue-500/10 bg-white/5 backdrop-blur-md flex items-center justify-center">
            <LayoutDashboard size={40} className="text-blue-500/40" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
