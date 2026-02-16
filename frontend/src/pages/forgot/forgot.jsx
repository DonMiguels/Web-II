import { ForgotLayout } from "@/auth/components/ForgotLayout/ForgotLayout";
import { motion } from "framer-motion";

export const Forgot = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f8fafc]">
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,...")` }} />
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-200/40 to-transparent rounded-full blur-[120px] animate-pulse" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-gradient-to-tl from-indigo-200/40 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="min-h-screen w-full flex items-center justify-center">
          <ForgotLayout />
        </div>
      </motion.div>
    </div>
  );
};