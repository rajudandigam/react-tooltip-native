import React from "react";
import { createRoot } from "react-dom/client";
import { Tooltip, Popover, useTooltip } from "@lib/react";
import "./styles.css";

function HookDemo() {
  const { open, setOpen, getTriggerProps, getTooltipProps, supports } = useTooltip({
    placement: "right",
  });

  return (
    <section aria-labelledby="hook-title">
      <h2 id="hook-title">useTooltip hook</h2>
      <button type="button" {...getTriggerProps()}>
        Hover me
      </button>
      {open && (
        <div {...getTooltipProps()}>
          Tooltip content (popover: {String(supports.popover)}, anchor: {String(supports.anchorPositioning)})
        </div>
      )}
      <button type="button" onClick={() => setOpen(!open)}>
        Toggle
      </button>
    </section>
  );
}

function ComponentDemo() {
  return (
    <section aria-labelledby="component-title">
      <h2 id="component-title">Tooltip component</h2>
      <Tooltip content="Copy to clipboard">
        <button type="button" data-component-trigger>
          📋
        </button>
      </Tooltip>
    </section>
  );
}

function PopoverDemo() {
  return (
    <section aria-labelledby="popover-title">
      <h2 id="popover-title">Popover component</h2>
      <Popover content={<div>Profile menu placeholder</div>}>
        <button type="button" data-popover-trigger>
          Open popover
        </button>
      </Popover>
    </section>
  );
}

function App() {
  return (
    <main>
      <h1>react-tooltip-native demo</h1>
      <HookDemo />
      <ComponentDemo />
      <PopoverDemo />
    </main>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
