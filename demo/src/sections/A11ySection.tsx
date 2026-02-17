import React, { useState } from "react";
import { Tooltip, Popover } from "@lib/react";
import { useDemo } from "../context/DemoContext";
import { Section } from "../components/Section";
import { ExampleCard } from "../components/ExampleCard";

export function A11ySection() {
  const { forceFallback } = useDemo();
  const [tooltipStatus, setTooltipStatus] = useState<string>("—");
  const [popoverStatus, setPopoverStatus] = useState<string>("—");
  const [ariaInspector, setAriaInspector] = useState<{ describedby?: string; expanded?: string; controls?: string }>({});

  const tooltipOpenChange = (open: boolean) => {
    setTooltipStatus(open ? "Open" : "Closed");
  };
  const popoverOpenChange = (open: boolean) => {
    setPopoverStatus(open ? "Open" : "Closed");
  };

  return (
    <Section
      id="a11y"
      title="Accessibility + keyboard"
      description="WCAG 1.4.13 behaviors and keyboard matrix; ARIA inspector for teaching."
    >
      <div className="showcase__grid">
        <ExampleCard
          name="a11y-tooltip-matrix"
          title="A) Tooltip keyboard checklist"
          description="Tab to trigger → opens. ESC closes. Shift+Tab away closes. Status row updates as events fire."
        >
          <div data-testid="a11y-tooltip-matrix">
            <p className="a11y-instruction">
              Tab to the button → tooltip opens. Press ESC or Shift+Tab away to close.
            </p>
            <Tooltip
              content="I open on focus and close on blur or ESC"
              onOpenChange={(open) => {
                tooltipOpenChange(open);
                setAriaInspector((prev) => ({ ...prev, describedby: open ? "tooltip-id" : undefined }));
              }}
              strategy={forceFallback ? "fallback" : "auto"}
              disableAnchorPositioning={forceFallback}
            >
              <button type="button">Tooltip trigger</button>
            </Tooltip>
            <p className="a11y-status" role="status" aria-live="polite">
              Status: {tooltipStatus}
            </p>
          </div>
        </ExampleCard>

        <ExampleCard
          name="a11y-popover-matrix"
          title="B) Popover keyboard checklist"
          description="Enter/Space opens. ESC closes. Tab navigates within content (no trap). restoreFocusOnClose demo."
        >
          <div data-testid="a11y-popover-matrix">
            <p className="a11y-instruction">
              Click or Enter/Space on trigger to open. Tab through content. ESC to close. Focus restores to trigger when
              restoreFocusOnClose=true.
            </p>
            <Popover
              content={
                <div>
                  <input type="text" placeholder="Tab here" aria-label="Input" />
                  <button type="button">Button</button>
                </div>
              }
              onOpenChange={(open) => {
                popoverOpenChange(open);
                setAriaInspector((prev) => ({
                  ...prev,
                  expanded: open ? "true" : undefined,
                  controls: open ? "popover-id" : undefined,
                }));
              }}
              restoreFocusOnClose={true}
              initialFocus="first"
              strategy={forceFallback ? "fallback" : "auto"}
              disableAnchorPositioning={forceFallback}
            >
              <button type="button">Popover trigger</button>
            </Popover>
            <p className="a11y-status" role="status" aria-live="polite">
              Status: {popoverStatus}
            </p>
          </div>
        </ExampleCard>

        <ExampleCard
          name="a11y-wcag-hoverable"
          title="C) WCAG 1.4.13 hoverable content"
          description="hoverableContent=true: moving pointer into tooltip keeps it open."
        >
          <div data-testid="a11y-wcag-hoverable">
            <Tooltip
              content="Move your cursor from the button into this tooltip — it stays open (WCAG 1.4.13)"
              hoverableContent={true}
              strategy={forceFallback ? "fallback" : "auto"}
              disableAnchorPositioning={forceFallback}
            >
              <button type="button">Hover then move to tooltip</button>
            </Tooltip>
          </div>
        </ExampleCard>

        <div className="example-card" data-testid="a11y-aria-inspector">
          <h3 className="example-card__title">ARIA inspector (dev teaching)</h3>
          <p className="example-card__description">
            When tooltip/popover open, trigger gets aria-describedby / aria-expanded / aria-controls. Shown below when
            available.
          </p>
          <pre className="aria-inspector-pre">
            <code>
              {JSON.stringify(
                {
                  "aria-describedby": ariaInspector.describedby ?? "(not set)",
                  "aria-expanded": ariaInspector.expanded ?? "(not set)",
                  "aria-controls": ariaInspector.controls ?? "(not set)",
                },
                null,
                2
              )}
            </code>
          </pre>
          <p className="a11y-instruction">
            Open a tooltip or popover above to see values update. (Demo uses placeholder IDs for display.)
          </p>
        </div>
      </div>
    </Section>
  );
}
