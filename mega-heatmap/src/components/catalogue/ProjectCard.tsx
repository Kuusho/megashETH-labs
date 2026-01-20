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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="project-card block group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-mega-gray-900 truncate">
              {project.name}
            </h3>
            {project.featured && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-mega-gray-600 line-clamp-2 mb-3">
            {project.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3">
            {/* Category badge */}
            {category && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: `${category.color}15`,
                  color: category.color,
                }}
              >
                {category.name}
              </span>
            )}

            {/* Twitter handle */}
            <span className="flex items-center gap-1 text-xs text-mega-gray-400">
              <Twitter className="w-3 h-3" />
              @{project.twitter}
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="project-arrow flex-shrink-0 text-mega-gray-300 transition-all">
          <ExternalLink className="w-5 h-5" />
        </div>
      </div>
    </motion.a>
  );
}

// Compact variant for grid views
export function ProjectCardCompact({ project, index = 0 }: ProjectCardProps) {
  const category = getCategoryInfo(project.category);

  return (
    <motion.a
      href={`https://twitter.com/${project.twitter}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={cn(
        "block p-4 rounded-xl border border-mega-gray-200 bg-white",
        "hover:border-mega-green/30 hover:shadow-mega",
        "transition-all duration-200 group"
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
          style={{ backgroundColor: category?.color || "#6B7280" }}
        >
          {project.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-mega-gray-900 truncate">{project.name}</h3>
          <p className="text-xs text-mega-gray-500">@{project.twitter}</p>
        </div>
        {project.featured && (
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
        )}
      </div>
      <p className="text-xs text-mega-gray-600 line-clamp-2">{project.description}</p>
    </motion.a>
  );
}
