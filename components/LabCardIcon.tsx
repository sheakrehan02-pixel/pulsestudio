"use client";

import type { LabId } from "@/lib/labs";

/** Accent hex per lab - icons use these to blend with card gradients */
const LAB_COLORS: Record<LabId, string> = {
  rhythm: "#5a9a8e",
  pitch: "#d4856a",
  "sound-design": "#e8b84a",
  pattern: "#5a9a8e",
  harmony: "#d4856a",
  creativity: "#e8b84a",
  tempo: "#4a8578",
  intervals: "#c27458",
  dynamics: "#d4a43a",
  memory: "#d4856a",
  scales: "#e69a80",
  groove: "#6ab09a",
};

interface LabCardIconProps {
  labId: LabId;
  size?: number;
  className?: string;
}

/** Animative-style illustrations: bold outlines, scene-based, each uses its card accent color */
export function LabCardIcon({ labId, size = 64, className = "" }: LabCardIconProps) {
  const accent = LAB_COLORS[labId];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {labId === "rhythm" && <RhythmIcon accent={accent} />}
      {labId === "pitch" && <PitchIcon accent={accent} />}
      {labId === "sound-design" && <SoundDesignIcon accent={accent} />}
      {labId === "pattern" && <PatternIcon accent={accent} />}
      {labId === "harmony" && <HarmonyIcon accent={accent} />}
      {labId === "creativity" && <CreativityIcon accent={accent} />}
      {labId === "tempo" && <TempoIcon accent={accent} />}
      {labId === "intervals" && <IntervalsIcon accent={accent} />}
      {labId === "dynamics" && <DynamicsIcon accent={accent} />}
      {labId === "memory" && <MemoryIcon accent={accent} />}
      {labId === "scales" && <ScalesIcon accent={accent} />}
      {labId === "groove" && <GrooveIcon accent={accent} />}
    </svg>
  );
}

function RhythmIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.85)";
  const w3 = "rgba(255,255,255,0.6)";
  return (
    <g strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      {/* Drummer silhouette - head, body, arms */}
      <circle cx="32" cy="16" r="6" fill={w} stroke={accent} />
      <path d="M32 22v14M28 36h8" stroke={w} fill="none" />
      <path d="M32 24l-6 12M32 24l8 10" stroke={w} strokeWidth={2} fill="none" />
      {/* Drums */}
      <ellipse cx="24" cy="36" rx="8" ry="4" fill={w2} stroke={w} />
      <ellipse cx="42" cy="34" rx="6" ry="3" fill={w2} stroke={w} />
      {/* Sticks in motion */}
      <path d="M26 22l4 14M38 20l-2 12" stroke={w} strokeWidth={2} fill="none" />
      {/* Beat energy */}
      <path d="M12 32c3 0 6-2 8 1M52 30c-3 0-6-1-8 2" stroke={w3} strokeWidth={1.5} fill="none" />
    </g>
  );
}

function PitchIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.7)";
  const w3 = "rgba(255,255,255,0.5)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      {/* Figure - head, mic gesture */}
      <circle cx="28" cy="18" r="5" fill={w} stroke={accent} />
      <path d="M28 23v10M24 33h8" stroke={w} fill="none" />
      <path d="M28 26c-2 2-4 4-4 6" stroke={w2} fill="none" />
      {/* Mic/voice */}
      <path d="M24 20l-2 6 4-2 4 2-2-6" stroke={w} fill={w2} />
      {/* Notes flowing up */}
      <ellipse cx="42" cy="16" rx="4" ry="2.5" fill={w} />
      <path d="M46 16v-8" stroke={w} fill="none" />
      <ellipse cx="48" cy="28" rx="3" ry="2" fill={w2} />
      <path d="M51 28v-6" stroke={w2} fill="none" />
      <path d="M36 12h8M38 24h10" stroke={w3} strokeWidth={1} fill="none" />
    </g>
  );
}

function SoundDesignIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.8)";
  const w3 = "rgba(255,255,255,0.5)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      {/* Figure at controls - head, hands */}
      <circle cx="28" cy="18" r="5" fill={w} stroke={accent} />
      <path d="M28 23v12M23 35l10-4M33 35l-10-6" stroke={w} fill="none" />
      {/* Mixer/equalizer surface */}
      <rect x="10" y="38" width="44" height="12" rx="2" fill={w2} stroke={w} />
      {/* Faders - varied heights */}
      <rect x="16" y="32" width="4" height="14" rx="1" fill={w} stroke={accent} />
      <rect x="24" y="26" width="4" height="20" rx="1" fill={w} stroke={accent} />
      <rect x="32" y="22" width="4" height="24" rx="1" fill={w} stroke={accent} />
      <rect x="40" y="28" width="4" height="18" rx="1" fill={w} stroke={accent} />
      <rect x="48" y="34" width="4" height="12" rx="1" fill={w} stroke={accent} />
      {/* Knobs */}
      <circle cx="20" cy="14" r="3" fill="none" stroke={w} strokeWidth={1.5} />
      <circle cx="32" cy="12" r="3" fill="none" stroke={w} strokeWidth={1.5} />
      <circle cx="44" cy="14" r="3" fill="none" stroke={w} strokeWidth={1.5} />
    </g>
  );
}

function PatternIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.8)";
  const w3 = "rgba(255,255,255,0.5)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      {/* Figure building - reaching */}
      <circle cx="36" cy="16" r="5" fill={w} stroke={accent} />
      <path d="M36 21v14M32 35h8" stroke={w} fill="none" />
      <path d="M36 24l8 8M36 28l-6 10" stroke={w} fill="none" />
      {/* Blocks assembling */}
      <rect x="14" y="36" width="12" height="12" rx="2" fill={w} stroke={accent} transform="rotate(-10 20 42)" />
      <rect x="28" y="32" width="10" height="10" rx="2" fill={w2} stroke={w} transform="rotate(5 33 37)" />
      <rect x="42" y="38" width="8" height="8" rx="2" fill={w2} stroke={w} transform="rotate(-5 46 42)" />
      {/* Motion - blocks connecting */}
      <path d="M26 40l4 4M38 36l4 4" stroke={w3} strokeWidth={1} fill="none" strokeDasharray="2 2" />
    </g>
  );
}

function HarmonyIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.8)";
  const w3 = "rgba(255,255,255,0.5)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      {/* Two figures together - harmony as collaboration */}
      <circle cx="22" cy="18" r="4" fill={w} stroke={accent} />
      <circle cx="42" cy="18" r="4" fill={w} stroke={accent} />
      <path d="M22 22v10M42 22v10M18 32h8M38 32h8" stroke={w} fill="none" />
      <path d="M22 24l-4 8M42 24l4 8" stroke={w2} fill="none" />
      {/* Shared chord - notes between them */}
      <ellipse cx="28" cy="38" rx="4" ry="2.5" fill={w} />
      <ellipse cx="36" cy="36" rx="4" ry="2.5" fill={w} />
      <path d="M40 36v-12" stroke={w} fill="none" />
      <rect x="32" y="22" width="12" height="3" rx="1" fill={w2} />
      {/* Connection */}
      <path d="M26 20c4 0 8 0 12 0" stroke={w3} strokeWidth={1} fill="none" />
    </g>
  );
}

function CreativityIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.8)";
  const w3 = "rgba(255,255,255,0.5)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      {/* Figure with brush - creating */}
      <circle cx="32" cy="16" r="5" fill={w} stroke={accent} />
      <path d="M32 21v12M28 33h8" stroke={w} fill="none" />
      <path d="M32 26l10 12" stroke={w} strokeWidth={2} fill="none" />
      {/* Brush */}
      <path d="M40 36l2 8 4-4-2-6" fill={w2} stroke={w} />
      {/* Canvas / creation */}
      <rect x="12" y="38" width="24" height="14" rx="2" fill={w2} stroke={w} />
      <path d="M16 44l6-4 4 2 6-6" stroke={w} fill="none" strokeWidth={1.5} />
      {/* Sparkles / ideas */}
      <path d="M48 20l1 4 3 1-3 1-1 4-1-4-3-1 3-1z" fill={w3} />
      <path d="M54 32l0.5 2 1.5 0.5-1.5 0.5-0.5 2-0.5-2-1.5-0.5 1.5-0.5z" fill={w3} />
    </g>
  );
}

function TempoIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.7)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      <circle cx="32" cy="32" r="18" fill="none" stroke={w} />
      <circle cx="32" cy="32" r="2" fill={w} />
      <path d="M32 32V18" stroke={accent} strokeWidth={2.5} />
      <path d="M32 32l10 6" stroke={w2} strokeWidth={2} />
      <path d="M14 32c0-10 8-18 18-18" stroke={w2} strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
      <text x="32" y="54" textAnchor="middle" fill={w2} fontSize="8" fontWeight="bold">BPM</text>
    </g>
  );
}

function IntervalsIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.7)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      <rect x="14" y="36" width="8" height="16" rx="1" fill={w} stroke={accent} />
      <rect x="28" y="24" width="8" height="28" rx="1" fill={w2} stroke={w} />
      <rect x="42" y="16" width="8" height="36" rx="1" fill={w} stroke={accent} />
      <path d="M18 36h14M36 24h10" stroke={w2} strokeWidth={1} strokeDasharray="2 2" />
      <ellipse cx="18" cy="32" rx="3" ry="2" fill={w} />
      <ellipse cx="32" cy="20" rx="3" ry="2" fill={w} />
      <path d="M35 20v-6" stroke={w} />
    </g>
  );
}

function DynamicsIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.6)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      <path d="M16 40 Q24 20 32 40 Q40 20 48 40" stroke={w} fill="none" />
      <path d="M12 44 Q20 28 32 44 Q44 28 52 44" stroke={w2} fill="none" strokeWidth={1.5} />
      <text x="10" y="56" fill={w2} fontSize="7" fontWeight="bold">pp</text>
      <text x="48" y="56" fill={w} fontSize="7" fontWeight="bold">ff</text>
      <circle cx="32" cy="16" r="4" fill={w} stroke={accent} />
      <path d="M28 24c2-2 8-2 8 0" stroke={accent} fill="none" />
    </g>
  );
}

function MemoryIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.7)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      <rect x="16" y="20" width="32" height="24" rx="3" fill={w2} stroke={w} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={24 + i * 8} cy={32} r="3" fill={i === 1 ? accent : w} stroke={w} />
      ))}
      <path d="M24 14l8-6 8 6" stroke={w} fill="none" />
      <path d="M48 24l4-2 2 4" stroke={accent} fill="none" />
      <path d="M12 28l-2 4 4 2" stroke={w2} fill="none" strokeWidth={1.5} />
    </g>
  );
}

function ScalesIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.7)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      <rect x="12" y="38" width="6" height="14" rx="1" fill={w} stroke={accent} />
      <rect x="22" y="30" width="6" height="22" rx="1" fill={w2} stroke={w} />
      <rect x="32" y="22" width="6" height="30" rx="1" fill={w} stroke={accent} />
      <rect x="42" y="16" width="6" height="36" rx="1" fill={w2} stroke={w} />
      <path d="M15 38h12M27 30h12M37 22h12" stroke={w2} strokeWidth={1} strokeDasharray="2 2" />
      <ellipse cx="45" cy="12" rx="3" ry="2" fill={w} />
      <path d="M48 12v-4" stroke={w} />
    </g>
  );
}

function GrooveIcon({ accent }: { accent: string }) {
  const w = "rgba(255,255,255,0.95)";
  const w2 = "rgba(255,255,255,0.7)";
  return (
    <g strokeWidth={2} strokeLinecap="round">
      <circle cx="32" cy="20" r="6" fill={w} stroke={accent} />
      <path d="M32 26v10M28 36h8" stroke={w} fill="none" />
      <path d="M32 28c-8 4-12 12-12 18M32 28c8 4 12 12 12 18" stroke={w2} fill="none" />
      {[14, 22, 30, 38, 46, 50].map((x, i) => (
        <circle key={i} cx={x} cy={48 + (i % 2) * 4} r="2.5" fill={i % 3 === 0 ? accent : w2} stroke={w} />
      ))}
      <path d="M10 44c4-2 8-2 12 0M42 44c4 2 8 2 12 0" stroke={w2} strokeWidth={1.5} fill="none" />
    </g>
  );
}
