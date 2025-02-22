import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/constants";

export function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited) {
      setIsReturningUser(true);
    } else {
      localStorage.setItem("hasVisited", "true");
      localStorage.setItem("firstVisit", new Date().toISOString());
    }

    // Hide welcome screen after animation
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="text-center p-8"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isReturningUser ? "Welcome Back to" : "Welcome to"}{" "}
              {COMPANY_NAME}
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {COMPANY_TAGLINE}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
