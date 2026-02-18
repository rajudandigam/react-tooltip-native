import React, { useEffect, useState } from "react";
import { useTooltip } from "@lib/react";
import { DemoProvider, useDemo } from "./context/DemoContext";
import { SidebarNav } from "./components/SidebarNav";
import { DebugBadge } from "./components/DebugBadge";
import { EventLog } from "./components/EventLog";
import { TooltipSection } from "./sections/TooltipSection";
import { PopoverSection } from "./sections/PopoverSection";
import { FixturesSection } from "./sections/FixturesSection";
import { A11ySection } from "./sections/A11ySection";

function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const update = () =>
      setSize({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

function DemoHeader() {
  const { supports } = useTooltip({});
  const { forceFallback, setForceFallback, reducedMotion, setReducedMotion, log, clearLog } = useDemo();
  const { width, height } = useViewportSize();

  return (
    <header className="demo-header" role="banner">
      <div className="demo-header__row">
        <h1 className="demo-header__title">react-tooltip-native showcase</h1>
      </div>
      <div className="demo-header__toolbar">
        <div className="demo-header__badges">
          <DebugBadge label="supports.popover" value={supports.popover} />
          <DebugBadge label="supports.anchorPositioning" value={supports.anchorPositioning} />
          <span className="demo-header__viewport" aria-label="Viewport size">
            viewport: {width}×{height}
          </span>
        </div>
        <div className="demo-header__controls">
          <label className="demo-header__toggle">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
              aria-label="Force fallback strategy for all examples"
            />
            Force fallback
          </label>
          <label className="demo-header__toggle">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              aria-label="Reduced motion (demo UI)"
            />
            Reduced motion
          </label>
        </div>
      </div>
      <div className="demo-header__eventlog" data-testid="global-event-log">
        <EventLog entries={log} onClear={clearLog} />
      </div>
    </header>
  );
}

function Showcase() {
  return (
    <div className="showcase">
      <TooltipSection />
      <PopoverSection />
      <FixturesSection />
      <A11ySection />
    </div>
  );
}

export function App() {
  return (
    <DemoProvider>
      <div className="demo-layout">
        <aside className="demo-sidebar">
          <SidebarNav />
        </aside>
        <div className="demo-main">
          <DemoHeader />
          <Showcase />
        </div>
      </div>
    </DemoProvider>
  );
}
