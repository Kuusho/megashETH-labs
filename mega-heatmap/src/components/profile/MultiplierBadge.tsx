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
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-help"
        style={{
          backgroundColor: active
            ? 'rgba(132, 226, 150, 0.12)'
            : 'rgba(174, 164, 191, 0.08)',
          color: active ? '#84e296' : '#8f6593',
          border: `1px solid ${active ? 'rgba(132, 226, 150, 0.3)' : 'rgba(174, 164, 191, 0.15)'}`,
        }}
      >
        <span className="text-sm leading-none">{emoji}</span>
        <span>{label}</span>
        {active && (
          <span
            className="font-mono font-bold text-[10px]"
            style={{ color: '#84e296' }}
          >
            {multiplier}
          </span>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg whitespace-nowrap z-20 shadow-lg"
            style={{
              backgroundColor: '#2d1b22',
              color: '#aea4bf',
              border: '1px solid rgba(174, 164, 191, 0.2)',
            }}
          >
            {description}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid #2d1b22',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
