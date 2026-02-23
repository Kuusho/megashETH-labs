/**
 * Multiplier Badge Component
 * 
 * Displays individual multiplier status with tooltip.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiplierBadgeProps {
  active: boolean;
  label: string;
  description: string;
  multiplier: string;
  emoji: string;
}

export function MultiplierBadge({
  active,
  label,
  description,
  multiplier,
  emoji,
}: MultiplierBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`
          inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 cursor-help
          ${
            active
              ? 'bg-mega-green text-white shadow-sm'
              : 'bg-mega-gray-100 text-mega-gray-400'
          }
        `}
      >
        <span>{emoji}</span>
        <span>{label}</span>
        {active && (
          <span className="text-xs font-bold opacity-90">
            {multiplier}
          </span>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-mega-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10"
          >
            {description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-mega-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
