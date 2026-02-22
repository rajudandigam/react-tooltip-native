import React, { useState } from "react";
import { Tooltip, useTooltip } from "@lib/react";

export function App() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("—");
  const [forceFallback, setForceFallback] = useState(false);

  const { supports } = useTooltip({});

  return (
    <>
      <h1 className="demo-header">Tooltip sanity check</h1>

      <dl className="debug-panel">
        <dt>supports.popover</dt>
        <dd>{supports.popover ? "✓" : "✗"}</dd>
        <dt>supports.anchorPositioning</dt>
        <dd>{supports.anchorPositioning ? "✓" : "✗"}</dd>
        <dt>open</dt>
        <dd>{String(open)}</dd>
        <dt>last reason</dt>
        <dd>{reason}</dd>
        <dt>strategy</dt>
        <dd>{forceFallback ? "fallback" : "auto"}</dd>
        <dt>disableAnchorPositioning</dt>
        <dd>{String(forceFallback)}</dd>
        <label>
          <input
            type="checkbox"
            checked={forceFallback}
            onChange={(e) => setForceFallback(e.target.checked)}
          />
          Force fallback
        </label>
      </dl>

      <div className="tooltip-example">
        <Tooltip
          content="Copy to clipboard"
          onOpenChange={(nextOpen, r) => {
            setOpen(nextOpen);
            setReason(r ?? "—");
          }}
          strategy={forceFallback ? "fallback" : "auto"}
          disableAnchorPositioning={forceFallback}
        >
          <button type="button">Hover or focus me</button>
        </Tooltip>
      </div>
    </>
  );
}
