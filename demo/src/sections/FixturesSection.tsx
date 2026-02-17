import React from "react";
import { Tooltip, Popover } from "@lib/react";
import type { Placement } from "@lib/react";
import { useDemo } from "../context/DemoContext";
import { Section } from "../components/Section";

function FixtureTooltip({
  children,
  content,
  placement,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: Placement;
}) {
  const { forceFallback } = useDemo();
  return (
    <Tooltip
      content={content}
      placement={placement}
      strategy={forceFallback ? "fallback" : "auto"}
      disableAnchorPositioning={forceFallback}
    >
      {children}
    </Tooltip>
  );
}

function FixturePopover({
  children,
  content,
  placement,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: Placement;
}) {
  const { forceFallback } = useDemo();
  return (
    <Popover
      content={content}
      placement={placement}
      strategy={forceFallback ? "fallback" : "auto"}
      disableAnchorPositioning={forceFallback}
    >
      {children}
    </Popover>
  );
}

export function FixturesSection() {
  return (
    <Section
      id="fixtures-clipping"
      title="Edge-case fixtures (Why this library exists)"
      description="Top Layer + anchor positioning: native avoids clipping; fallback positions correctly but may still be clipped by container."
    >
      <div className="showcase__grid">
        <div
          className="fixture-card"
          data-testid="fixture-overflow-hidden"
          data-rt-fixture="overflow-hidden"
        >
          <h3 className="fixture-card__title">A) overflow:hidden clipping</h3>
          <p className="fixture-card__expected">
            <strong>Expected:</strong> Native: not clipped (Top Layer). Fallback: may be clipped — we document this
            honestly.
          </p>
          <p className="fixture-card__steps">Try: hover trigger near edge, open popover, then scroll if any.</p>
          <div
            className="fixture-clip-box"
            style={{
              overflow: "hidden",
              height: "120px",
              border: "2px solid #ccc",
              position: "relative",
              padding: "8px",
            }}
          >
            <FixtureTooltip content="Tooltip in overflow:hidden">
              <button type="button">Tooltip (top)</button>
            </FixtureTooltip>
            <span style={{ marginLeft: "1rem" }} />
            <FixturePopover content={<p style={{ margin: 0 }}>Popover in overflow:hidden</p>}>
              <button type="button">Popover</button>
            </FixturePopover>
          </div>
        </div>

        <div
          className="fixture-card"
          data-testid="fixture-transformed"
          data-rt-fixture="transformed"
        >
          <h3 className="fixture-card__title">B) Transformed container (final boss)</h3>
          <p className="fixture-card__expected">
            <strong>Expected:</strong> Native: not clipped, stable. Fallback: positions correctly; may be clipped.
          </p>
          <p className="fixture-card__steps">Try: hover/click, check placement top and bottom.</p>
          <div
            className="fixture-transform-box"
            style={{
              transform: "translateZ(0) scale(0.95)",
              border: "2px solid #999",
              padding: "16px",
              background: "#f5f5f5",
            }}
          >
            <FixtureTooltip content="Tooltip in transformed container" placement="top">
              <button type="button">Tooltip top</button>
            </FixtureTooltip>
            <span style={{ marginLeft: "1rem" }} />
            <FixtureTooltip content="Tooltip bottom" placement="bottom">
              <button type="button">Tooltip bottom</button>
            </FixtureTooltip>
            <span style={{ marginLeft: "1rem" }} />
            <FixturePopover content={<p style={{ margin: 0 }}>Popover in transform</p>} placement="top">
              <button type="button">Popover</button>
            </FixturePopover>
          </div>
        </div>

        <div
          className="fixture-card"
          data-testid="fixture-stacking-context"
          data-rt-fixture="stacking-context"
        >
          <h3 className="fixture-card__title">C) Nested stacking context (z-index)</h3>
          <p className="fixture-card__expected">
            <strong>Expected:</strong> Overlay appears on top of modal content (native: Top Layer; fallback: fixed).
          </p>
          <p className="fixture-card__steps">Try: open tooltip/popover inside the fake modal.</p>
          <div
            className="fixture-stacking"
            style={{
              position: "relative",
              zIndex: 10,
              background: "rgba(0,0,0,0.3)",
              padding: "24px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                position: "relative",
                zIndex: 20,
                background: "#fff",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <p style={{ margin: "0 0 0.75rem" }}>Fake modal content</p>
              <FixtureTooltip content="Tooltip inside modal">
                <button type="button">Tooltip</button>
              </FixtureTooltip>
              <span style={{ marginLeft: "0.5rem" }} />
              <FixturePopover content={<p style={{ margin: 0 }}>Popover inside modal</p>}>
                <button type="button">Popover</button>
              </FixturePopover>
            </div>
          </div>
        </div>

        <div
          className="fixture-card"
          data-testid="fixture-scroll-container"
          data-rt-fixture="scroll-container"
        >
          <h3 className="fixture-card__title">D) Scroll container</h3>
          <p className="fixture-card__expected">
            <strong>Expected:</strong> Native: anchored, tethered. Fallback: reposition via scroll parents, follows
            correctly.
          </p>
          <p className="fixture-card__steps">Try: open tooltip then scroll the box.</p>
          <div
            className="fixture-scroll-box"
            style={{
              height: "160px",
              overflow: "auto",
              border: "2px solid #ccc",
              padding: "8px",
            }}
          >
            <div style={{ height: "80px" }}>Scroll down...</div>
            <FixtureTooltip content="I stay tethered when you scroll">
              <button type="button">Trigger mid-way</button>
            </FixtureTooltip>
            <div style={{ height: "120px" }}>...more content</div>
          </div>
        </div>

        <div
          className="fixture-card"
          data-testid="fixture-responsive"
          data-rt-fixture="responsive"
        >
          <h3 className="fixture-card__title">E) Responsive (narrow)</h3>
          <p className="fixture-card__expected">
            <strong>Expected:</strong> Overlay doesn&apos;t cause layout shift; fits in narrow width.
          </p>
          <p className="fixture-card__steps">Try: open tooltip/popover in narrow strip.</p>
          <div
            className="fixture-responsive-box"
            style={{
              maxWidth: "360px",
              border: "2px solid #ccc",
              padding: "12px",
            }}
          >
            <FixtureTooltip content="Tooltip in narrow container">
              <button type="button">Tooltip</button>
            </FixtureTooltip>
            <span style={{ marginLeft: "0.5rem" }} />
            <FixturePopover content={<p style={{ margin: 0 }}>Popover</p>}>
              <button type="button">Popover</button>
            </FixturePopover>
          </div>
        </div>
      </div>

      <p className="fixture-honest-note">
        <strong>Honest note:</strong> In overflow-hidden and transformed containers, the native path solves clipping via
        the Top Layer. The fallback positions correctly but can still be clipped by the container — we don&apos;t claim
        otherwise.
      </p>
    </Section>
  );
}
