"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LabTipProps {
  title: string;
  tips: string[];
  defaultOpen?: boolean;
}

export default function LabTip({ title, tips, defaultOpen = false }: LabTipProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--accent-teal-soft)",
        border: "1px solid rgba(90, 154, 142, 0.3)",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors hover:bg-white/5"
      >
        <span
          className="text-sm font-semibold flex items-center gap-2"
          style={{ color: "var(--accent-teal)" }}
        >
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-lg"
          style={{ color: "var(--text-muted)" }}
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-4 space-y-2">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-sm flex items-start gap-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="mt-0.5"
                    style={{ color: "var(--accent-teal)" }}
                  >
                    •
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
