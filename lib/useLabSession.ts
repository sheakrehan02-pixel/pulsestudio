"use client";

import { useEffect, useRef, useCallback } from "react";
import { recordLabSession } from "./sessionProgress";
import type { LabId } from "./labs";

export function useLabSession(labId: LabId) {
  const startRef = useRef(Date.now());
  const activityRef = useRef(0);

  const recordActivity = useCallback((count = 1) => {
    activityRef.current += count;
  }, []);

  useEffect(() => {
    startRef.current = Date.now();
    activityRef.current = 0;
    return () => {
      const durationMs = Date.now() - startRef.current;
      const activity = activityRef.current;
      const xpEarned = Math.min(30, Math.floor(activity / 2) + Math.floor(durationMs / 60000) * 5);
      if (durationMs > 3000 || activity > 0) {
        recordLabSession({
          labId,
          startedAt: startRef.current,
          durationMs,
          activityCount: activity,
          xpEarned,
        });
      }
    };
  }, [labId]);

  return { recordActivity };
}
