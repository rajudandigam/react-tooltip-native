import React, { useState } from "react";
import { Tooltip, useTooltip } from "@lib/react";

type DemoView = "sanity" | "controlled" | "hoverable";

export function App() {
  const [view, setView] = useState<DemoView>("sanity");

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("—");
  const [forceFallback, setForceFallback] = useState(false);

  const [controlledOpen, setControlledOpen] = useState(false);
  const [controlledReason, setControlledReason] = useState<string>("—");

  const { supports } = useTooltip({});

  return (
    <>
      <h1 className="demo-header">react-tooltip-native demo</h1>

      <nav className="demo-nav" data-testid="demo-nav" aria-label="Demo section">
        <button
          type="button"
          className={"demo-nav-btn" + (view === "sanity" ? " is-active" : "")}
          onClick={() => setView("sanity")}
          data-testid="nav-sanity"
        >
          Sanity check
        </button>
        <button
          type="button"
          className={"demo-nav-btn" + (view === "controlled" ? " is-active" : "")}
          onClick={() => setView("controlled")}
          data-testid="nav-controlled"
        >
          Controlled
        </button>
        <button
          type="button"
          className={"demo-nav-btn" + (view === "hoverable" ? " is-active" : "")}
          onClick={() => setView("hoverable")}
          data-testid="nav-hoverable"
        >
          Hoverable content
        </button>
      </nav>

      <p className="demo-supports" data-testid="demo-supports">
        Supports: popover {supports.popover ? "✓" : "✗"} · anchor positioning {supports.anchorPositioning ? "✓" : "✗"}
      </p>

      {view === "sanity" && (
        <section className="demo-view" data-testid="view-sanity">
          <dl className="debug-panel" data-testid="debug-panel">
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
                data-testid="force-fallback-checkbox"
              />
              Force fallback
            </label>
          </dl>
          <div className="tooltip-example" data-testid="section-sanity">
            <Tooltip
              content="Copy to clipboard"
              onOpenChange={(nextOpen, r) => {
                setOpen(nextOpen);
                setReason(r ?? "—");
              }}
              openDelay={150}
              closeDelay={50}
              strategy={forceFallback ? "fallback" : "auto"}
              disableAnchorPositioning={forceFallback}
              style={forceFallback ? { position: "fixed" } : undefined}
            >
              <button type="button" data-testid="sanity-trigger">
                Hover or focus me
              </button>
            </Tooltip>
          </div>
        </section>
      )}

      {view === "controlled" && (
        <section className="demo-view tooltip-section" data-testid="section-controlled-tooltip">
          <h2 className="demo-section-title">Controlled vs hover-only</h2>
          <p className="demo-section-desc">
            <strong>Hover-only:</strong> hover or focus the button below — tooltip opens and closes with interaction.{" "}
            <strong>Controlled:</strong> use the checkbox or setOpen buttons to open/close; the tooltip stays open until you change that.
          </p>
          <dl className="debug-panel compact">
            <dt>controlledOpen</dt>
            <dd>{String(controlledOpen)}</dd>
            <dt>last reason</dt>
            <dd>{controlledReason}</dd>
          </dl>
          <div className="tooltip-example tooltip-example-controlled">
            <Tooltip
              className="tooltip-overlay-hover-only"
              content="I only show on hover or focus"
              openDelay={150}
              closeDelay={50}
              strategy="fallback"
              disableAnchorPositioning={true}
              style={{ position: "fixed" }}
              onOpenChange={(_, r) => setControlledReason(r ?? "—")}
            >
              <button type="button" data-testid="controlled-hover-trigger">
                Hover or focus me (hover-only)
              </button>
            </Tooltip>
          </div>
          <div className="controlled-actions">
            <label>
              <input
                type="checkbox"
                checked={controlledOpen}
                onChange={(e) => setControlledOpen(e.target.checked)}
                data-testid="controlled-open-checkbox"
              />
              Open controlled tooltip
            </label>
            <div className="controlled-buttons">
              <button
                type="button"
                onClick={() => setControlledOpen(true)}
                data-testid="controlled-open-btn"
              >
                setOpen(true)
              </button>
              <button
                type="button"
                onClick={() => setControlledOpen(false)}
                data-testid="controlled-close-btn"
              >
                setOpen(false)
              </button>
            </div>
          </div>
          <div className="tooltip-example tooltip-example-controlled">
            <Tooltip
              className="tooltip-overlay-controlled"
              content="Controlled tooltip content"
              open={controlledOpen}
              onOpenChange={(next, r) => {
                setControlledOpen(next);
                setControlledReason(r ?? "—");
              }}
              openDelay={150}
              closeDelay={50}
              strategy="fallback"
              disableAnchorPositioning={true}
              style={{ position: "fixed" }}
            >
              <button type="button" data-testid="controlled-tooltip-trigger">
                Trigger (anchor only)
              </button>
            </Tooltip>
          </div>
        </section>
      )}

      {view === "hoverable" && (
        <section className="demo-view tooltip-section" data-testid="section-hoverable-content">
          <h2 className="demo-section-title">Hoverable content (WCAG 1.4.13)</h2>
          <p className="demo-section-desc">
            <strong>hoverableContent=true:</strong> hover the trigger, then move the pointer into the tooltip — it stays open so you can read or interact.{" "}
            <strong>hoverableContent=false:</strong> tooltip closes when the pointer leaves the trigger (no moving into the tooltip).
          </p>
          <div className="tooltip-row">
            <div className="tooltip-example">
              <Tooltip
                className="tooltip-overlay-hover-only"
                content="You can move your pointer here — I stay open."
                hoverableContent={true}
                openDelay={150}
                closeDelay={300}
                strategy="fallback"
                disableAnchorPositioning={true}
                style={{ position: "fixed" }}
              >
                <button type="button" data-testid="hoverable-true-trigger">
                  Hoverable: true
                </button>
              </Tooltip>
            </div>
            <div className="tooltip-example">
              <Tooltip
                className="tooltip-overlay-hover-only"
                content="I close when you leave the button."
                hoverableContent={false}
                openDelay={150}
                closeDelay={100}
                strategy="fallback"
                disableAnchorPositioning={true}
                style={{ position: "fixed" }}
              >
                <button type="button" data-testid="hoverable-false-trigger">
                  Hoverable: false
                </button>
              </Tooltip>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
