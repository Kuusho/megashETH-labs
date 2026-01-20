"use client";

import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface HeatmapTooltipProps {
  date: string;
  count: number;
  x: number;
  y: number;
}

export function HeatmapTooltip({ date, count, x, y }: HeatmapTooltipProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formattedDate = format(parseISO(date), "MMMM d, yyyy");
  const plural = count === 1 ? "transaction" : "transactions";

  const tooltip = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className="fixed z-50 pointer-events-none"
        style={{
          left: x,
          top: y - 8,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div
          className="text-xs rounded-sm px-3 py-2 shadow-lg"
          style={{
            backgroundColor: '#1a1617',
            border: '1px solid #312c2d',
          }}
        >
          <div className="font-semibold" style={{ color: '#dfdadb' }}>
            {count > 0 ? (
              <>
                <span style={{ color: '#eb4511' }}>{count}</span> {plural}
              </>
            ) : (
              "No transactions"
            )}
          </div>
          <div style={{ color: '#878283' }} className="mt-0.5">
            {formattedDate}
          </div>
          {/* Arrow */}
          <div
            className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{ backgroundColor: '#1a1617', borderRight: '1px solid #312c2d', borderBottom: '1px solid #312c2d' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(tooltip, document.body);
}
