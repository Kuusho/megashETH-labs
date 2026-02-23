"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const BUNNY_POSES = {
  default: `
   ∧＿∧
  （｡･ω･｡)つ━☆・*。
  ⊂　　 ノ 　　　・゜+.
   しーJ　　　　　°。+ *´¨)`,
  
  wink: `
   ∧＿∧
  （｡･‿･｡)つ━☆・*。
  ⊂　　 ノ 　　　・゜+.
   しーJ　　　　　°。+ *´¨)`,
  
  excited: `
   ∧＿∧
  (｡♥‿♥｡)つ━☆・*。
  ⊂　　 ノ 　　　・゜+.
   しーJ　　　　　°。+ *´¨)`,
  
  carrot: `
   ∧＿∧
  （｡･ω･｡)🥕
  ⊂　　 ノ
   しーJ`,
};

interface BunnyMascotProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  interactive?: boolean;
}

export function BunnyMascot({ size = "md", animated = true, interactive = false }: BunnyMascotProps) {
  const [pose, setPose] = useState<keyof typeof BUNNY_POSES>("default");
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "text-[8px] leading-[1.1]",
    md: "text-[10px] leading-[1.1]",
    lg: "text-[14px] leading-[1.2]",
  };

  const handleClick = () => {
    if (!interactive) return;
    
    const poses = Object.keys(BUNNY_POSES) as Array<keyof typeof BUNNY_POSES>;
    const currentIndex = poses.indexOf(pose);
    const nextIndex = (currentIndex + 1) % poses.length;
    setPose(poses[nextIndex]);
  };

  return (
    <motion.div
      className={`inline-block ${sizeClasses[size]} font-mono select-none ${interactive ? 'cursor-pointer' : ''}`}
      style={{
        color: isHovered && interactive ? '#ff85d4' : '#ff6b35',
        textShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
        transition: 'color 0.2s ease',
      }}
      onClick={handleClick}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      animate={animated ? {
        y: [0, -2, 0],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      whileHover={interactive ? { scale: 1.05 } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
    >
      <pre className="whitespace-pre">{BUNNY_POSES[pose]}</pre>
    </motion.div>
  );
}

export function BunnyLoader() {
  return (
    <motion.div
      className="inline-block text-[12px] font-mono"
      style={{
        color: '#ff6b35',
        textShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
      }}
      animate={{
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <pre className="whitespace-pre">{`
   ∧＿∧
  （｡･ω･｡) analyzing...
  ⊂　　 ノ
   しーJ`}</pre>
    </motion.div>
  );
}

// Mini bunny for inline use
export function MiniBunny({ color = "#ff6b35" }: { color?: string }) {
  return (
    <span
      className="inline-block text-[8px] font-mono leading-none"
      style={{
        color,
        textShadow: `0 0 5px ${color}80`,
      }}
    >
      ∧＿∧
    </span>
  );
}

// Carrot emoji with glow
export function GlowCarrot() {
  return (
    <motion.span
      className="inline-block"
      animate={{
        rotate: [0, -10, 10, -10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      style={{
        filter: 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.6))',
      }}
    >
      🥕
    </motion.span>
  );
}
