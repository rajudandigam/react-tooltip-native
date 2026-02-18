import React, { useRef, useState } from "react";
import { Popover } from "@lib/react";
import { useDemo } from "../context/DemoContext";
import { Section } from "../components/Section";
import { ExampleCard } from "../components/ExampleCard";

function PopoverWithDemoProps({
  children,
  content,
  exampleName,
  ...rest
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  exampleName: string;
  [key: string]: unknown;
}) {
  const { forceFallback, addLog } = useDemo();
  const {
    strategy: strategyProp,
    disableAnchorPositioning: disableAnchorProp,
    ...passThrough
  } = rest as {
    strategy?: "auto" | "native" | "fallback";
    disableAnchorPositioning?: boolean;
    [key: string]: unknown;
  };
  return (
    <Popover
      content={content}
      onOpenChange={(open, reason) => addLog(exampleName, open, reason)}
      strategy={forceFallback ? "fallback" : strategyProp}
      disableAnchorPositioning={forceFallback || Boolean(disableAnchorProp)}
      {...passThrough}
    >
      {children}
    </Popover>
  );
}

/** Manual popover with a Close button that actually closes (controlled + onOpenChange). */
function ManualPopoverWithClose() {
  const [open, setOpen] = useState(false);
  const { forceFallback, addLog } = useDemo();
  return (
    <Popover
      content={
        <div>
          <p style={{ margin: "0 0 0.5rem" }}>Manual: I stay open. Close with button or ESC.</p>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      }
      mode="manual"
      open={open}
      onOpenChange={(next, reason) => {
        setOpen(next);
        addLog("popover-manual", next, reason);
      }}
      strategy={forceFallback ? "fallback" : undefined}
      disableAnchorPositioning={forceFallback}
    >
      <button type="button">manual</button>
    </Popover>
  );
}

export function PopoverSection() {
  const { forceFallback } = useDemo();
  const [controlledOpen, setControlledOpen] = useState(false);
  const focusTargetRef = useRef<HTMLButtonElement>(null);

  return (
    <Section id="popovers-basic" title="Popovers" description="MVP popover variations.">
      <div className="showcase__grid">
        <ExampleCard
          name="popover-basic"
          title="A) Basic popover (click trigger)"
          description="Content: text + input + button. initialFocus='first'."
          code={`<Popover
  content={<><p>Name</p><input /><button>Save</button></>}
  initialFocus="first"
>
  <button>Open</button>
</Popover>`}
        >
          <PopoverWithDemoProps
            exampleName="popover-basic"
            content={
              <>
                <p style={{ margin: "0 0 0.5rem" }}>Enter name</p>
                <input type="text" placeholder="Name" aria-label="Name" />
                <button type="button" style={{ marginLeft: "0.5rem" }}>
                  Save
                </button>
              </>
            }
            initialFocus="first"
          >
            <button type="button">Open popover</button>
          </PopoverWithDemoProps>
        </ExampleCard>

        <ExampleCard
          name="popover-modes"
          title="B) mode=auto vs mode=manual"
          description="Left: auto (closes on outside press). Right: manual (persists; close via button or ESC)."
          code={`<Popover mode="auto" content={...} />
<Popover mode="manual" open={open} onOpenChange={setOpen} content={
  <><p>Manual: ...</p><button onClick={() => setOpen(false)}>Close</button></>
} />`}
        >
          <div className="flex gap-1">
            <PopoverWithDemoProps
              exampleName="popover-auto"
              content={
                <div>
                  <p style={{ margin: "0 0 0.5rem" }}>Auto: click outside to close</p>
                  <button type="button">OK</button>
                </div>
              }
              mode="auto"
            >
              <button type="button">auto</button>
            </PopoverWithDemoProps>
            <ManualPopoverWithClose />
          </div>
        </ExampleCard>

        <ExampleCard
          name="popover-outsidepress"
          title="C) closeOnOutsidePress variations"
          description="Left: auto + closeOnOutsidePress=false — in fallback, click outside keeps it open (in native, auto always closes on outside). Right: manual + closeOnOutsidePress=true — click outside closes. Use Force fallback to see left example stay open on outside click."
          code={`<Popover mode="auto" closeOnOutsidePress={false} content={...} />
<Popover mode="manual" closeOnOutsidePress={true} content={...} />`}
        >
          <div className="flex gap-1">
            <PopoverWithDemoProps
              exampleName="popover-auto-no-outside"
              content={
                <p style={{ margin: 0 }}>
                  Auto + closeOnOutsidePress=false. Click outside — I stay open.
                </p>
              }
              mode="auto"
              closeOnOutsidePress={false}
            >
              <button type="button">auto, no outside</button>
            </PopoverWithDemoProps>
            <PopoverWithDemoProps
              exampleName="popover-manual-outside"
              content={
                <p style={{ margin: 0 }}>
                  Manual + closeOnOutsidePress=true. Click outside — I close.
                </p>
              }
              mode="manual"
              closeOnOutsidePress={true}
            >
              <button type="button">manual, outside</button>
            </PopoverWithDemoProps>
          </div>
        </ExampleCard>

        <ExampleCard
          name="popover-initialfocus"
          title="D) initialFocus variants"
          description="first, none, and ref to specific element."
          code={`<Popover initialFocus="first" />
<Popover initialFocus="none" />
<Popover initialFocus={focusTargetRef} />`}
        >
          <div className="flex gap-1 flex-wrap">
            <PopoverWithDemoProps
              exampleName="popover-first"
              content={
                <div>
                  <input type="text" placeholder="First focus" aria-label="First" />
                  <button type="button">Second</button>
                </div>
              }
              initialFocus="first"
            >
              <button type="button">first</button>
            </PopoverWithDemoProps>
            <PopoverWithDemoProps
              exampleName="popover-none"
              content={
                <div>
                  <p style={{ margin: 0 }}>Focus stays on trigger</p>
                  <input type="text" placeholder="Not focused" aria-label="Not focused" />
                </div>
              }
              initialFocus="none"
            >
              <button type="button">none</button>
            </PopoverWithDemoProps>
            <PopoverWithDemoProps
              exampleName="popover-ref"
              content={
                <div>
                  <button type="button">Not me</button>
                  <button type="button" ref={focusTargetRef}>
                    Focus me (ref)
                  </button>
                </div>
              }
              initialFocus={focusTargetRef}
            >
              <button type="button">ref</button>
            </PopoverWithDemoProps>
          </div>
        </ExampleCard>

        <ExampleCard
          name="popover-restorefocus"
          title="E) restoreFocusOnClose"
          description="Left: true (focus returns to trigger). Right: false."
          code={`<Popover restoreFocusOnClose={true} />
<Popover restoreFocusOnClose={false} />`}
        >
          <div className="flex gap-1">
            <PopoverWithDemoProps
              exampleName="popover-restore-true"
              content={<p style={{ margin: 0 }}>Close me — focus returns to trigger</p>}
              restoreFocusOnClose={true}
            >
              <button type="button">restore true</button>
            </PopoverWithDemoProps>
            <PopoverWithDemoProps
              exampleName="popover-restore-false"
              content={<p style={{ margin: 0 }}>Close me — focus does not return</p>}
              restoreFocusOnClose={false}
            >
              <button type="button">restore false</button>
            </PopoverWithDemoProps>
          </div>
        </ExampleCard>

        <ExampleCard
          name="popover-clickandfocus"
          title="F) trigger=click-and-focus"
          description="Opens on click or when trigger receives focus (e.g. Tab)."
          code={`<Popover trigger="click-and-focus" content={...}>
  <button>Open</button>
</Popover>`}
        >
          <PopoverWithDemoProps
            exampleName="popover-clickandfocus"
            content={<p style={{ margin: 0 }}>I opened on click or focus</p>}
            trigger="click-and-focus"
          >
            <button type="button">Tab to me or click</button>
          </PopoverWithDemoProps>
        </ExampleCard>

        <ExampleCard
          name="popover-controlled"
          title="G) Controlled popover"
          description="Checkbox controls open; onOpenChange logs reason."
          code={`const [open, setOpen] = useState(false);
<Popover open={open} onOpenChange={(o, r) => { setOpen(o); }} content={...}>
  <button>Trigger</button>
</Popover>`}
        >
          <div className="flex gap-1 flex-wrap align-center">
            <PopoverWithDemoProps
              exampleName="popover-controlled"
              content={<p style={{ margin: 0 }}>Controlled</p>}
              open={controlledOpen}
              onOpenChange={(open) => setControlledOpen(open)}
            >
              <button type="button">Trigger</button>
            </PopoverWithDemoProps>
            <label className="flex align-center gap-1">
              <input
                type="checkbox"
                checked={controlledOpen}
                onChange={(e) => setControlledOpen(e.target.checked)}
                aria-label="Control open"
              />
              Open
            </label>
          </div>
        </ExampleCard>

        <ExampleCard
          name="popover-strategies"
          title="Strategy subsection"
          description="auto / native / fallback + disableAnchorPositioning. Force Fallback overrides."
          code={`<Popover strategy="auto" /> ... <Popover strategy="fallback" />`}
        >
          <div className="flex gap-1 flex-wrap">
            <PopoverWithDemoProps
              exampleName="popover-auto-s"
              content={<span>auto</span>}
              strategy={forceFallback ? "fallback" : "auto"}
              disableAnchorPositioning={forceFallback}
            >
              <button type="button">auto</button>
            </PopoverWithDemoProps>
            <PopoverWithDemoProps
              exampleName="popover-native-s"
              content={<span>native</span>}
              strategy={forceFallback ? "fallback" : "native"}
              disableAnchorPositioning={forceFallback}
            >
              <button type="button">native</button>
            </PopoverWithDemoProps>
            <PopoverWithDemoProps exampleName="popover-fallback-s" content={<span>fallback</span>} strategy="fallback">
              <button type="button">fallback</button>
            </PopoverWithDemoProps>
            <PopoverWithDemoProps
              exampleName="popover-no-anchor"
              content={<span>no anchor</span>}
              disableAnchorPositioning={true}
              strategy={forceFallback ? "fallback" : "auto"}
            >
              <button type="button">no anchor</button>
            </PopoverWithDemoProps>
          </div>
        </ExampleCard>
      </div>

    </Section>
  );
}
