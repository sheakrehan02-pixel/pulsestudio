"use client";

import { createContext, useContext, ReactNode } from "react";
import { useLabSession } from "@/lib/useLabSession";
import type { LabId } from "@/lib/labs";

const LabSessionContext = createContext<((count?: number) => void) | null>(null);

export function LabSessionProvider({
  labId,
  children,
}: {
  labId: LabId;
  children: ReactNode;
}) {
  const { recordActivity } = useLabSession(labId);
  return (
    <LabSessionContext.Provider value={recordActivity}>
      {children}
    </LabSessionContext.Provider>
  );
}

export function useLabActivity() {
  return useContext(LabSessionContext);
}
