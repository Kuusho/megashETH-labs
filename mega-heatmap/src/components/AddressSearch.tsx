"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveToAddress, type ResolvedUser } from "@/lib/neynar";
import { cn } from "@/lib/utils";

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
        setError("Could not resolve address. Try a valid 0x address, @username, or FID.");
      }
    } catch (err) {
      setError("Failed to lookup address. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [input, onAddressResolved]);

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
          <div className="absolute left-4 pointer-events-none" style={{ color: '#878283' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
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
              "w-full pl-12 pr-24 py-3 rounded-sm text-sm font-mono",
              "transition-all duration-200",
              "focus:outline-none focus:ring-1",
              error ? "ring-1" : ""
            )}
            style={{
              backgroundColor: '#111011',
              color: '#dfdadb',
              borderColor: error ? '#b02e0c' : 'transparent',
              ...(error ? {} : { '--tw-ring-color': '#eb4511' } as React.CSSProperties),
            }}
          />

          {/* Clear button */}
          {input && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-20 p-1 rounded-sm transition-colors hover:bg-[#1a1617]"
              style={{ color: '#878283' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "absolute right-2 px-4 py-1.5 rounded-sm text-sm font-medium",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{
              backgroundColor: input.trim() ? '#eb4511' : '#1a1617',
              color: input.trim() ? '#0a0909' : '#878283',
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </span>
            ) : (
              "Look up"
            )}
          </button>
        </div>
      </form>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 text-xs"
            style={{ color: '#b02e0c' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Resolved user preview */}
      <AnimatePresence>
        {resolvedUser && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 p-3 rounded-sm flex items-center gap-3"
            style={{ backgroundColor: 'rgba(235, 69, 17, 0.1)' }}
          >
            {resolvedUser.pfpUrl ? (
              <img
                src={resolvedUser.pfpUrl}
                alt={resolvedUser.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #eb4511 0%, #ff9000 100%)', color: '#0a0909' }}
              >
                {resolvedUser.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" style={{ color: '#dfdadb' }}>
                @{resolvedUser.username}
              </p>
              <p className="text-xs font-mono truncate" style={{ color: '#878283' }}>
                {resolvedUser.primaryAddress}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#878283' }}>FID</p>
              <p className="font-mono text-sm" style={{ color: '#eb4511' }}>{resolvedUser.fid}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
