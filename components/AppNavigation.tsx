"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { playClickSound } from "@/lib/audio";
import { LabIcon } from "@/components/icons";

export default function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { path: "/studio", label: "Studio", icon: "target" as const },
    { path: "/labs", label: "Labs", icon: "flask" as const },
    { path: "/labs/rhythm", label: "Rhythm", icon: "drum" as const },
    { path: "/labs/creativity", label: "Create", icon: "palette" as const },
    { path: "/progress", label: "Stats", icon: "bar-chart" as const },
  ];

  const handleNavigation = (path: string) => {
    if (pathname !== path) {
      void playClickSound();
      router.push(path);
    }
  };

  if (pathname === "/") {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom backdrop-blur-xl"
      style={{
        background: "rgba(20, 25, 26, 0.88)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-colors"
              style={{
                color: isActive ? "var(--accent-teal)" : "var(--text-muted)",
              }}
            >
              <span className="mb-0.5 flex justify-center">
                <LabIcon id={item.icon} size={22} style={{ color: "inherit" }} />
              </span>
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: "var(--accent-teal)" }}
                  initial={false}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
