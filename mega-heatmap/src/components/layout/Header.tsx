"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Flame, LayoutDashboard, Trophy, Rocket } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Heatmap", href: "/heatmap", icon: Flame },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Deployments", href: "/deployments", icon: Rocket },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-xl border-b"
        style={{
          backgroundColor: "rgba(59, 37, 44, 0.88)",
          borderColor: "rgba(174, 164, 191, 0.15)",
        }}
      />

      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
              style={{
                backgroundColor: "rgba(132, 226, 150, 0.12)",
                border: "1px solid rgba(132, 226, 150, 0.3)",
                color: "#84e296",
              }}
            >
              BI
            </div>
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: "#f5f8de" }}
            >
              Bunny Intel
            </span>
            <span
              className="hidden sm:block text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "rgba(174, 164, 191, 0.08)",
                border: "1px solid rgba(174, 164, 191, 0.12)",
                color: "#8f6593",
              }}
            >
              megaeth
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150",
                  )}
                  style={{
                    color: isActive ? "#84e296" : "#aea4bf",
                    backgroundColor: isActive
                      ? "rgba(132, 226, 150, 0.08)"
                      : "transparent",
                  }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                      style={{ backgroundColor: "#84e296" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ConnectButton
                chainStatus="icon"
                showBalance={false}
                accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
              />
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md transition-colors"
              style={{ color: "#aea4bf" }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden py-3 border-t"
              style={{ borderColor: "rgba(174, 164, 191, 0.12)" }}
            >
              <div className="flex flex-col gap-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: isActive
                          ? "rgba(132, 226, 150, 0.08)"
                          : "transparent",
                        color: isActive ? "#84e296" : "#aea4bf",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="pt-3 px-3">
                  <ConnectButton />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
