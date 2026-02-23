"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveToAddress, type ResolvedUser } from "@/lib/neynar";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface AddressSearchProps {
  onAddressResolved: (address: string, user?: ResolvedUser) => void;
  placeholder?: string;
  className?: string;
}

export function AddressSearch({
  onAddressResolved,
  placeholder = "Enter address, @username, or FID",
  className,
}: AddressSearchProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedUser, setResolvedUser] = useState<ResolvedUser | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      setIsLoading(true);
      setError(null);
      setResolvedUser(null);

      try {
        const result = await resolveToAddress(input.trim());
        if (result) {
          setResolvedUser(result.user || null);
          onAddressResolved(result.address, result.user);
        } else {
          setError(
            "Could not resolve address. Try a valid 0x address, @username, or FID."
          );
        }
      } catch (err) {
        setError("Failed to look up address. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [input, onAddressResolved]
  );

  const handleClear = useCallback(() => {
    setInput("");
    setError(null);
    setResolvedUser(null);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Search icon */}
          <div
            className="absolute left-3.5 pointer-events-none"
            style={{ color: "#8f6593" }}
          >
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "w-full pl-10 pr-28 py-2.5 rounded-lg text-sm font-mono",
              "transition-all duration-150 focus:outline-none"
            )}
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              border: `1px solid ${error ? "var(--color-error)" : "var(--color-border-strong)"}`,
              boxShadow: error
                ? "0 0 0 3px rgba(255, 123, 123, 0.1)"
                : undefined,
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px var(--color-accent-dim)";
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor =
                  "var(--color-border-strong)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          />

          {/* Clear button */}
          {input && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-20 p-1 rounded transition-opacity hover:opacity-60"
              style={{ color: "#8f6593" }}
              aria-label="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: input.trim()
                ? "var(--color-accent)"
                : "rgba(174,164,191,0.1)",
              color: input.trim() ? "var(--color-bg)" : "var(--color-dim)",
            }}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              "Look up"
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 text-xs font-mono"
            style={{ color: "var(--color-error)" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Resolved user */}
      <AnimatePresence>
        {resolvedUser && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-3 p-3 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor: "var(--color-accent-dim)",
              border: "1px solid rgba(132, 226, 150, 0.2)",
            }}
          >
            {resolvedUser.pfpUrl ? (
              <img
                src={resolvedUser.pfpUrl}
                alt={resolvedUser.username}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{
                  backgroundColor: "rgba(132, 226, 150, 0.2)",
                  color: "var(--color-accent)",
                }}
              >
                {resolvedUser.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--color-text)" }}
              >
                @{resolvedUser.username}
              </p>
              <p
                className="text-xs font-mono truncate"
                style={{ color: "var(--color-muted)" }}
              >
                {resolvedUser.primaryAddress}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs" style={{ color: "var(--color-dim)" }}>
                FID
              </p>
              <p
                className="font-mono text-sm font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                {resolvedUser.fid}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
