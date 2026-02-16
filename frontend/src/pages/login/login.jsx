import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

import { LoginForm } from "@/auth/components/LoginForm/LoginForm";
import { useTheme } from "@/context/ThemeContext";

import { Button } from "@/components/ui/button";

export const Login = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden  transition-colors duration-500">
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-primary)]"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </Button>
      </div>

      <div
        className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-400/20 dark:from-blue-600/10 to-transparent rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-gradient-to-tl from-indigo-400/20 dark:from-indigo-600/10 to-transparent rounded-full blur-[120px] animate-pulse"
        style={{ animationDuration: "8s" }}
      />

      <div
        className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.2]"
        style={{
          backgroundImage: `linear-gradient(var(--grid-color) 1px, transparent 1px), 
                            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <LoginForm />
      </motion.div>
    </div>
  );
};
