"use client";

import {
  Drum,
  Music,
  SlidersHorizontal,
  LayoutGrid,
  Palette,
  FlaskConical,
  BarChart2,
  Flame,
  Target,
  Timer,
  Ruler,
  Key,
  Piano,
  Sparkles,
  Lock,
  Music2,
  Leaf,
  Zap,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

export type IconId =
  | "drum"
  | "music"
  | "music2"
  | "sliders"
  | "blocks"
  | "palette"
  | "flask"
  | "bar-chart"
  | "flame"
  | "target"
  | "timer"
  | "ruler"
  | "key"
  | "piano"
  | "sparkles"
  | "lock"
  | "leaf"
  | "zap"
  | "party";

const ICON_MAP: Record<IconId, LucideIcon> = {
  drum: Drum,
  music: Music,
  music2: Music2,
  sliders: SlidersHorizontal,
  blocks: LayoutGrid,
  palette: Palette,
  flask: FlaskConical,
  "bar-chart": BarChart2,
  flame: Flame,
  target: Target,
  timer: Timer,
  ruler: Ruler,
  key: Key,
  piano: Piano,
  sparkles: Sparkles,
  lock: Lock,
  leaf: Leaf,
  zap: Zap,
  party: PartyPopper,
};

interface LabIconProps {
  id: IconId | string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function LabIcon({ id, size = 24, className = "", style }: LabIconProps) {
  const Icon = ICON_MAP[id as IconId] ?? Music;
  return (
    <Icon
      size={size}
      strokeWidth={1.75}
      className={className}
      style={style}
      aria-hidden
    />
  );
}
