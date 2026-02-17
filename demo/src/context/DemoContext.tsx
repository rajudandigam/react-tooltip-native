/**
 * Global demo state: force fallback, reduced motion, event log.
 * Examples read context and apply strategy/disableAnchorPositioning when forceFallback is true.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { OpenChangeReason } from "@lib/react";

export type LogEntry = {
  at: number;
  source: string;
  open: boolean;
  reason: OpenChangeReason;
};

type DemoContextValue = {
  forceFallback: boolean;
  setForceFallback: (v: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  log: LogEntry[];
  addLog: (source: string, open: boolean, reason: OpenChangeReason) => void;
  clearLog: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [forceFallback, setForceFallback] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = useCallback((source: string, open: boolean, reason: OpenChangeReason) => {
    setLog((prev) => [...prev.slice(-99), { at: Date.now(), source, open, reason }]);
  }, []);

  const clearLog = useCallback(() => setLog([]), []);

  const value = useMemo(
    () => ({
      forceFallback,
      setForceFallback,
      reducedMotion,
      setReducedMotion,
      log,
      addLog,
      clearLog,
    }),
    [forceFallback, reducedMotion, log, addLog, clearLog]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
