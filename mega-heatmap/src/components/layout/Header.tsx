"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BunnyMascot, MiniBunny } from "@/components/BunnyMascot";

const navigation = [
  { name: "Heatmap", href: "/heatmap", emoji: "🔥" },
  { name: "Dashboard", href: "/dashboard", emoji: "📊" },
  { name: "Leaderboard", href: "/leaderboard", emoji: "🏆" },
  { name: "Deployments", href: "/deployments", emoji: "🚀" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Backdrop with rainbow edge */}
      <div
        className="absolute inset-0 backdrop-blur-xl border-b-2"
        style={{
          backgroundColor: 'rgba(10, 9, 9, 0.9)',
          borderColor: logoHovered ? '#ff85d4' : '#ff6b35',
          transition: 'border-color 0.3s ease',
        }}
      >
        {/* Subtle gradient top border */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, #ff6b35 0%, #ff85d4 25%, #4ecdc4 50%, #ffe66d 75%, #06ffa5 100%)',
          }}
        />
      </div>

      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <Link href="/" className="flex items-center gap-3 group">
              {/* Bunny mascot */}
              <motion.div
                className="hidden sm:block"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BunnyMascot size="sm" animated interactive />
              </motion.div>

              {/* Logo text */}
              <div className="flex flex-col">
                <motion.span
                  className="text-xl font-bold tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b35 0%, #ff85d4 50%, #a770ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  Bunny Intel
                </motion.span>
                <span className="text-[10px] font-mono" style={{ color: '#878283' }}>
                  onchain quant <MiniBunny /> megaeth
                </span>
              </div>

              {/* Carrot indicator */}
              <motion.span
                className="text-lg"
                animate={logoHovered ? {
                  rotate: [0, -10, 10, -10, 0],
                } : {}}
                transition={{ duration: 0.5 }}
              >
                🥕
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop nav */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-1"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                    isActive ? "text-gradient-bunny" : ""
                  )}
                  style={{
                    color: isActive ? undefined : '#878283',
                    backgroundColor: isActive ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.emoji}</span>
                    {item.name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #ff6b35, #ff85d4)',
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </motion.div>

          {/* Right side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="hidden sm:block">
              <ConnectButton
                chainStatus="icon"
                showBalance={false}
                accountStatus={{
                  smallScreen: "avatar",
                  largeScreen: "full",
                }}
              />
            </div>

            {/* Mobile menu button */}
            <motion.button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-all"
              style={{
                color: mobileMenuOpen ? '#ff85d4' : '#878283',
                backgroundColor: mobileMenuOpen ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
              }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden py-4 border-t"
              style={{ borderColor: 'rgba(255, 107, 53, 0.2)' }}
            >
              <div className="flex flex-col gap-2">
                {navigation.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: isActive ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                          color: isActive ? '#ff6b35' : '#878283',
                        }}
                      >
                        <span className="text-lg">{item.emoji}</span>
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
                <div className="pt-4 px-3">
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
