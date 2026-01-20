"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Heatmap", href: "/heatmap" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Catalogue", href: "/catalogue" },
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
          backgroundColor: 'rgba(10, 9, 9, 0.85)',
          borderColor: 'rgba(49, 44, 45, 0.5)'
        }}
      />

      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo mark - placeholder */}
              <div className="relative w-8 h-8">
                <div
                  className="absolute inset-0 rounded-sm blur-sm transition-all group-hover:blur-md"
                  style={{ backgroundColor: 'rgba(235, 69, 17, 0.3)' }}
                />
                <div
                  className="relative w-full h-full rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: '#eb4511' }}
                >
                  <span className="font-bold text-sm" style={{ color: '#0a0909' }}>M</span>
                </div>
              </div>
              <span className="text-lg font-semibold tracking-tight" style={{ color: '#dfdadb' }}>
                mega<span style={{ color: '#eb4511' }}>SHETH</span>
              </span>
            </Link>
          </motion.div>

          {/* Desktop nav */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-8"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium transition-colors duration-150"
                  style={{
                    color: isActive ? '#eb4511' : '#878283',
                  }}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.color = '#dfdadb')}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = '#878283')}
                >
                  {item.name}
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
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 transition-colors"
              style={{ color: '#878283' }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </motion.div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t"
            style={{ borderColor: 'rgba(49, 44, 45, 0.5)' }}
          >
            <div className="flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-sm text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: isActive ? 'rgba(235, 69, 17, 0.1)' : 'transparent',
                      color: isActive ? '#eb4511' : '#878283',
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 px-3">
                <ConnectButton />
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
