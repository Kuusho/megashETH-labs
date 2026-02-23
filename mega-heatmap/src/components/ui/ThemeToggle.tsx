"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-150"
            style={{
                color: "var(--color-muted)",
                backgroundColor: "transparent",
            }}
            whileHover={{
                backgroundColor: "var(--color-surface-raised)",
                color: "var(--color-text)",
            }}
            whileTap={{ scale: 0.9 }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.span
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="absolute"
                    >
                        <Sun className="w-4 h-4" />
                    </motion.span>
                ) : (
                    <motion.span
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="absolute"
                    >
                        <Moon className="w-4 h-4" />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
