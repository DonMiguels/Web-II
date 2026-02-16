import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export const NotificationToast = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, duration]);

  const toastStyles =
    type === "error"
      ? "bg-red-50/90 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
      : "bg-green-50/90 border-green-200 text-green-900 dark:bg-green-950/40 dark:border-green-800 dark:text-green-200";

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className={`fixed bottom-5 right-5 z-[100] flex items-center p-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${toastStyles}`}
          style={{ minWidth: "320px" }}
        >
          <div className="flex-shrink-0">
            {type === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
            )}
          </div>

          <div className="ml-3 mr-8">
            <p className="text-sm font-bold uppercase tracking-wider">
              {type === "error" ? "Error" : "Éxito"}
            </p>
            <p className="text-xs font-medium opacity-80">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="absolute right-3 p-1.5 rounded-full transition-all 
                       hover:bg-black/5 dark:hover:bg-white/10 group cursor-pointer"
          >
            <X className="w-4 h-4 opacity-40 group-hover:opacity-100" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
