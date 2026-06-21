"use client";

import { motion } from "framer-motion";
import type { SoundArchetype } from "@/lib/soundIdentity";

interface SoundIdentityCardProps {
  archetype: SoundArchetype;
  insight?: string;
  reveal?: boolean;
  compact?: boolean;
}

export default function SoundIdentityCard({
  archetype,
  insight,
  reveal = true,
  compact = false,
}: SoundIdentityCardProps) {
  return (
    <motion.div
      initial={reveal ? { opacity: 0, scale: 0.85, rotateX: 12 } : false}
      animate={reveal ? { opacity: 1, scale: 1, rotateX: 0 } : undefined}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-3xl ${compact ? "p-5" : "p-8"}`}
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${archetype.accent}44`,
        boxShadow: `0 24px 80px ${archetype.accent}22`,
      }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${archetype.gradient} opacity-20`}
      />
      <motion.div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-30"
        style={{ background: archetype.accent }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10">
        <motion.div
          initial={reveal ? { opacity: 0, y: 10 } : false}
          animate={reveal ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.3 }}
          className="text-xs uppercase tracking-[0.25em] mb-3 font-medium"
          style={{ color: archetype.accent }}
        >
          Your Sound Identity
        </motion.div>

        <motion.h2
          initial={reveal ? { opacity: 0, y: 16 } : false}
          animate={reveal ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.45, duration: 0.8 }}
          className={`font-display font-semibold mb-2 ${compact ? "text-2xl" : "text-4xl"}`}
          style={{ color: "var(--text-primary)" }}
        >
          {archetype.title}
        </motion.h2>

        <motion.p
          initial={reveal ? { opacity: 0 } : false}
          animate={reveal ? { opacity: 1 } : undefined}
          transition={{ delay: 0.6 }}
          className={`italic mb-4 ${compact ? "text-sm" : "text-lg"}`}
          style={{ color: archetype.accent }}
        >
          &ldquo;{archetype.tagline}&rdquo;
        </motion.p>

        {!compact && (
          <motion.p
            initial={reveal ? { opacity: 0 } : false}
            animate={reveal ? { opacity: 1 } : undefined}
            transition={{ delay: 0.75 }}
            className="text-sm leading-relaxed mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {archetype.description}
          </motion.p>
        )}

        <div className={`grid ${compact ? "grid-cols-1 gap-2" : "grid-cols-2 gap-3"}`}>
          <div
            className="rounded-xl p-3"
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              Your Edge
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{archetype.edge}</div>
          </div>
          {!compact && (
            <div
              className="rounded-xl p-3"
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                Growth Edge
              </div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{archetype.growthEdge}</div>
            </div>
          )}
        </div>

        {insight && (
          <motion.p
            initial={reveal ? { opacity: 0, y: 8 } : false}
            animate={reveal ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 1 }}
            className="text-xs mt-4 text-center italic"
            style={{ color: "var(--text-muted)" }}
          >
            {insight}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
