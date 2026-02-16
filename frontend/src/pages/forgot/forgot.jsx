import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

import { ForgotLayout } from "@/auth/componentsAuth";
import { useTheme } from "@/context";
import { Button } from "@/components/ui/button";

import Logo from "@/assets/img/uru-logo-maracaibo.png";

export const Forgot = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-500"
      style={{
        background:
          theme === "light"
            ? `radial-gradient(at bottom right, rgba(37, 99, 235, 0.15) 0%, transparent 50%),
               radial-gradient(at bottom left, rgba(29, 78, 216, 0.1) 0%, transparent 40%),
               linear-gradient(to bottom, #ffffff 70%, #dbeafe 100%)`
            : `radial-gradient(at bottom right, rgba(30, 58, 138, 0.3) 0%, transparent 50%),
               radial-gradient(at bottom left, rgba(22, 20, 56, 0.4) 0%, transparent 40%),
               linear-gradient(to bottom, #000000 70%, #0a0a2e 100%)`,
      }}
    >
      <div className="fixed top-6 left-8 z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img
            src={Logo}
            alt="Logo URU"
            className="h-12 w-auto object-contain filter drop-shadow-sm"
          />
        </motion.div>
      </div>

      <div className="fixed top-6 right-8 z-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-primary)] backdrop-blur-sm bg-white/5"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </Button>
        </motion.div>
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
        className="relative z-10 w-full max-w-md px-6 flex justify-center"
      >
        <ForgotLayout />
      </motion.div>
    </div>
  );
};
