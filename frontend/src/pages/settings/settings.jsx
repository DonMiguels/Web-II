import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import Permissions from "./permission/permission.jsx";
import AssignProfile from "./assignprofile/assignprofile.jsx";

const Settings = () => {
  const location = useLocation();
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname]);

  const getSettingsComponent = () => {
    switch (location.pathname) {
      case "/settings/profiles":
        return <AssignProfile embedded />;
      case "/settings/permissions":
      default:
        return <Permissions embedded />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main
        ref={contentRef}
        className="flex-1 relative overflow-y-scroll custom-scrollbar"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {getSettingsComponent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Settings;
