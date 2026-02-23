"use client";

import { motion } from "framer-motion";
import { ExternalLink, Twitter, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, CategoryInfo } from "@/data/catalogue";
import { getCategoryInfo } from "@/data/catalogue";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const category = getCategoryInfo(project.category);

  return (
    <motion.a
      href={`https://twitter.com/${project.twitter}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="project-card block group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <h3
              className="text-sm font-semibold truncate"
              style={{ color: '#f5f8de' }}
            >
              {project.name}
            </h3>
            {project.featured && (
              <Star
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: '#e8c37a', fill: '#e8c37a' }}
              />
            )}
          </div>

          {/* Description */}
          <p
            className="text-xs line-clamp-2 mb-3 leading-relaxed"
            style={{ color: '#8f6593' }}
          >
            {project.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3">
            {category && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: `${category.color}12`,
                  color: category.color,
                  border: `1px solid ${category.color}30`,
                }}
              >
                {category.name}
              </span>
            )}
            <span
              className="flex items-center gap-1 text-[10px] font-mono"
              style={{ color: '#8f6593' }}
            >
              <Twitter className="w-3 h-3" />
              @{project.twitter}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ExternalLink
          className="w-4 h-4 flex-shrink-0 transition-colors"
          style={{ color: '#8f6593' }}
        />
      </div>
    </motion.a>
  );
}

// Compact variant
export function ProjectCardCompact({ project, index = 0 }: ProjectCardProps) {
  const category = getCategoryInfo(project.category);

  return (
    <motion.a
      href={`https://twitter.com/${project.twitter}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={cn(
        "block p-4 rounded-lg border transition-all duration-150 group",
      )}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#84e296';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-7 h-7 rounded flex items-center justify-center font-bold text-[10px] font-mono flex-shrink-0"
          style={{
            backgroundColor: `${category?.color ?? '#8f6593'}15`,
            color: category?.color ?? '#8f6593',
          }}
        >
          {project.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium truncate"
            style={{ color: '#f5f8de' }}
          >
            {project.name}
          </h3>
          <p className="text-[10px] font-mono" style={{ color: '#8f6593' }}>
            @{project.twitter}
          </p>
        </div>
        {project.featured && (
          <Star
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: '#e8c37a', fill: '#e8c37a' }}
          />
        )}
      </div>
      <p
        className="text-xs line-clamp-2 leading-relaxed"
        style={{ color: '#8f6593' }}
      >
        {project.description}
      </p>
    </motion.a>
  );
}
