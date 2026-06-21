"use client";

import { motion } from "framer-motion";
import type { SkillScores, SkillDomain } from "@/lib/assessment";
import { DOMAIN_LABELS, getSkillLevelLabel } from "@/lib/assessment";

interface SkillRadarProps {
  scores: SkillScores;
  size?: number;
  highlightWeak?: boolean;
}

const DOMAINS: SkillDomain[] = [
  "rhythm",
  "pitch",
  "sound",
  "structure",
  "harmony",
  "creativity",
];

const DOMAIN_COLORS: Record<SkillDomain, string> = {
  rhythm: "var(--accent-teal)",
  pitch: "var(--accent-coral)",
  sound: "var(--accent-amber)",
  structure: "#6ab09a",
  harmony: "#e69a80",
  creativity: "#c9a0dc",
};

export default function SkillRadar({ scores, size = 220, highlightWeak = true }: SkillRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = DOMAINS.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPoints = DOMAINS.map((d, i) => {
    const r = (scores[d] / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle(i)),
      y: cy + r * Math.sin(angle(i)),
      domain: d,
      score: scores[d],
    };
  });

  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const minScore = Math.min(...DOMAINS.map((d) => scores[d]));

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridLevels.map((level) => {
          const pts = DOMAINS.map((_, i) => {
            const r = maxR * level;
            return `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth={1}
            />
          );
        })}

        {DOMAINS.map((_, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + maxR * Math.cos(angle(i))}
            y2={cy + maxR * Math.sin(angle(i))}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        ))}

        <motion.polygon
          points={polygon}
          fill="rgba(90, 154, 142, 0.2)"
          stroke="var(--accent-teal)"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {dataPoints.map((p, i) => (
          <motion.circle
            key={p.domain}
            cx={p.x}
            cy={p.y}
            r={highlightWeak && p.score === minScore ? 6 : 4}
            fill={DOMAIN_COLORS[p.domain]}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08 }}
          />
        ))}
      </svg>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full max-w-xs">
        {DOMAINS.map((d) => (
          <div key={d} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: DOMAIN_COLORS[d] }}
              />
              {DOMAIN_LABELS[d].split(" ")[0]}
            </span>
            <span style={{ color: DOMAIN_COLORS[d] }} className="font-semibold">
              {scores[d]} · {getSkillLevelLabel(scores[d])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
