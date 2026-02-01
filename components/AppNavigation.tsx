"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { playClickSound } from "@/lib/audio";

export default function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { path: "/labs", label: "Labs", icon: "🧪" },
    { path: "/labs/rhythm", label: "Rhythm", icon: "🥁" },
    { path: "/labs/pitch", label: "Pitch", icon: "🎵" },
    { path: "/labs/creativity", label: "Create", icon: "🎨" },
    { path: "/progress", label: "Stats", icon: "📊" },
  ];

  const handleNavigation = (path: string) => {
    if (pathname !== path) {
      void playClickSound();
      router.push(path);
    }
  };

  // Don't show navigation on landing page
  if (pathname === "/") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-blue-400" : "text-gray-500"
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-400 rounded-t-full"
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

