"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Flame, LayoutDashboard, Trophy, Rocket } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navigation = [
  { name: "Heatmap", href: "/heatmap", icon: Flame },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Deployments", href: "/deployments", icon: Rocket },
];

// ─── Individual nav link with glass hover ─────────────────────────────────────

function NavLink({
  item,
  isActive,
  onClick,
  mobile = false,
}: {
  item: (typeof navigation)[number];
  isActive: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex items-center gap-2 font-medium transition-colors duration-150",
        mobile ? "px-3 py-2.5 rounded-md text-sm w-full" : "px-3 py-1.5 rounded-md text-sm"
      )}
      style={{
        // Text: active = accent, hovered = primary text, rest = clearly readable muted
        color: isActive
          ? "var(--color-accent)"
          : hovered
            ? "var(--color-text)"
            : "var(--color-muted)",
      }}
    >
      {/* Glass hover background */}
      <AnimatePresence>
        {(hovered || isActive) && (
          <motion.span
            className="absolute inset-0 rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              backgroundColor: isActive
                ? "var(--color-accent-dim)"
                : "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <Icon className="relative w-3.5 h-3.5 flex-shrink-0" />

      {/* Label */}
      <span className="relative">{item.name}</span>

      {/* Active underline */}
      {isActive && (
        <motion.div
          layoutId={mobile ? "activeNavMobile" : "activeNav"}
          className="absolute bottom-0 left-3 right-3 h-px rounded-full"
          style={{ backgroundColor: "var(--color-accent)" }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      )}
    </Link>
  );
}

// ─── Identity Chip ────────────────────────────────────────────────────────────

function IdentityChip() {
  const { address, isConnected } = useAccount();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [twitter, setTwitter] = useState<string | null>(null);
  const checkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setDisplayName(null);
      setTwitter(null);
      checkedRef.current = null;
      return;
    }
    if (checkedRef.current === address.toLowerCase()) return;
    checkedRef.current = address.toLowerCase();

    fetch(`/api/profile?address=${address}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.profile) {
          setDisplayName(data.profile.displayName ?? null);
          setTwitter(data.profile.twitter ?? null);
        }
      })
      .catch(() => {});
  }, [address, isConnected]);

  if (!isConnected || !displayName) return null;

  const label = displayName;
  const sub = twitter
    ? (twitter.startsWith('@') ? twitter : `@${twitter}`)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md"
      style={{
        backgroundColor: 'rgba(132, 226, 150, 0.06)',
        border: '1px solid rgba(132, 226, 150, 0.18)',
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ backgroundColor: 'rgba(132,226,150,0.2)', color: 'var(--color-accent)' }}
      >
        {label.slice(0, 1).toUpperCase()}
      </div>
      <div className="leading-none">
        <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
          {label}
        </div>
        {sub && (
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-dim)' }}>
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-xl border-b"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-bg) 88%, transparent)",
          borderColor: "var(--color-border)",
        }}
      />

      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 transition-colors duration-150"
              style={{
                backgroundColor: "var(--color-accent-dim)",
                border: "1px solid var(--color-accent)",
                color: "var(--color-accent)",
              }}
            >
              BI
            </div>
            <span
              className="text-sm font-bold tracking-tight transition-colors duration-150"
              style={{ color: "var(--color-text)" }}
            >
              Bunny Intel
            </span>
            <span
              className="hidden sm:block text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                color: "var(--color-dim)",
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
              return (
                <NavLink key={item.name} item={item} isActive={isActive} />
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <IdentityChip />
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
              style={{ color: "var(--color-muted)" }}
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
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex flex-col gap-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <NavLink
                      key={item.name}
                      item={item}
                      isActive={isActive}
                      mobile
                      onClick={() => setMobileMenuOpen(false)}
                    />
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
