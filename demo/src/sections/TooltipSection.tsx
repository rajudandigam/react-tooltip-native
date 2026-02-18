import React, { useState } from "react";
import { Tooltip } from "@lib/react";
import { useDemo } from "../context/DemoContext";
import { Section } from "../components/Section";
import { ExampleCard } from "../components/ExampleCard";

const PLACEMENTS = [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
  "right",
  "right-start",
  "right-end",
] as const;

function TooltipWithDemoProps({
  children,
  content,
  exampleName,
  strategy: strategyProp,
  disableAnchorPositioning: disableAnchorProp,
  ...rest
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  exampleName: string;
  strategy?: "auto" | "native" | "fallback";
  disableAnchorPositioning?: boolean;
  [key: string]: unknown;
}) {
  const { forceFallback, reducedMotion, addLog } = useDemo();
  const finalProps = {
    ...rest,
    openDelay: reducedMotion ? 0 : (rest.openDelay as number | undefined),
    closeDelay: reducedMotion ? 0 : (rest.closeDelay as number | undefined),
  };
  return (
    <Tooltip
      content={content}
      onOpenChange={(open, reason) => addLog(exampleName, open, reason)}
      strategy={forceFallback ? "fallback" : strategyProp}
      disableAnchorPositioning={forceFallback || disableAnchorProp}
      {...finalProps}
    >
      {children}
    </Tooltip>
  );
}

export function TooltipSection() {
  const { forceFallback, addLog } = useDemo();
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <Section id="tooltips-basic" title="Tooltips" description="MVP tooltip variations.">
      <div className="showcase__grid">
        <ExampleCard
          name="tooltip-basic"
          title="A) Basic tooltip (default)"
          description="Placement top; hover + focus opens; aria-describedby only when open."
          code={`<Tooltip content="Copy to clipboard">
  <button type="button">Hover or focus me</button>
</Tooltip>`}
        >
          <TooltipWithDemoProps content="Copy to clipboard" exampleName="tooltip-basic">
            <button type="button">Hover or focus me</button>
          </TooltipWithDemoProps>
        </ExampleCard>

        <ExampleCard
          name="tooltip-placements"
          title="B) Placements grid (all 12)"
          description="Each button shows tooltip with placement name. Uses fallback strategy here so start/end placements align correctly to their triggers (native anchor positioning can misalign in dense grids)."
          code={`<Tooltip content="top" placement="top">
  <button>top</button>
</Tooltip>`}
        >
          <div className="placements-grid" data-rt-fixture="placements">
            {PLACEMENTS.map((p) => (
              <TooltipWithDemoProps
                key={p}
                content={p}
                placement={p}
                exampleName={`tooltip-${p}`}
                strategy="fallback"
              >
                <button type="button">{p}</button>
              </TooltipWithDemoProps>
            ))}
          </div>
        </ExampleCard>

        <ExampleCard
          name="tooltip-delays"
          title="C) Delays"
          description="Left: openDelay=800, closeDelay=300. Right: openDelay=0, closeDelay=0."
          code={`<Tooltip openDelay={800} closeDelay={300} content="Slow">
  <button>Slow</button>
</Tooltip>
<Tooltip openDelay={0} closeDelay={0} content="Instant">
  <button>Instant</button>
</Tooltip>`}
        >
          <div className="flex gap-1">
            <TooltipWithDemoProps
              content="Opens after 800ms, closes after 300ms"
              exampleName="tooltip-slow"
              openDelay={800}
              closeDelay={300}
            >
              <button type="button">Slow</button>
            </TooltipWithDemoProps>
            <TooltipWithDemoProps
              content="Opens and closes instantly"
              exampleName="tooltip-instant"
              openDelay={0}
              closeDelay={0}
            >
              <button type="button">Instant</button>
            </TooltipWithDemoProps>
          </div>
        </ExampleCard>

        <ExampleCard
          name="tooltip-hoverable"
          title="D) hoverableContent true vs false"
          description="Left: hoverableContent=true (cursor can enter tooltip). Right: false (tooltip closes when leaving trigger)."
          code={`<Tooltip hoverableContent={true} content="Stay open when hovering me">
  <button>hoverableContent=true</button>
</Tooltip>
<Tooltip hoverableContent={false} content="Closes when you leave trigger">
  <button>hoverableContent=false</button>
</Tooltip>`}
        >
          <div className="flex gap-1">
            <TooltipWithDemoProps
              content="Move cursor into tooltip — it stays open"
              exampleName="tooltip-hoverable-true"
              hoverableContent={true}
            >
              <button type="button">hoverableContent=true</button>
            </TooltipWithDemoProps>
            <TooltipWithDemoProps
              content="Leaving trigger closes me; I don't catch pointer"
              exampleName="tooltip-hoverable-false"
              hoverableContent={false}
            >
              <button type="button">hoverableContent=false</button>
            </TooltipWithDemoProps>
          </div>
        </ExampleCard>

        <ExampleCard
          name="tooltip-controlled"
          title="E) Controlled tooltip"
          description="Open state controlled by checkbox + setOpen buttons; onOpenChange logs reason."
          code={`const [open, setOpen] = useState(false);
<Tooltip open={open} onOpenChange={(o, r) => { setOpen(o); console.log(r); }} content="...">
  <button>Trigger</button>
</Tooltip>
<input type="checkbox" checked={open} onChange={e => setOpen(e.target.checked)} />`}
        >
          <div className="flex gap-1 flex-wrap align-center">
            <TooltipWithDemoProps
              content="I am controlled"
              exampleName="tooltip-controlled"
              open={controlledOpen}
              onOpenChange={(open, reason) => {
                setControlledOpen(open);
                addLog("tooltip-controlled", open, reason);
              }}
            >
              <button type="button">Trigger</button>
            </TooltipWithDemoProps>
            <label className="flex align-center gap-1">
              <input
                type="checkbox"
                checked={controlledOpen}
                onChange={(e) => setControlledOpen(e.target.checked)}
                aria-label="Control open state"
              />
              Open
            </label>
            <button type="button" onClick={() => setControlledOpen(true)}>
              setOpen(true)
            </button>
            <button type="button" onClick={() => setControlledOpen(false)}>
              setOpen(false)
            </button>
          </div>
        </ExampleCard>

        <ExampleCard
          name="tooltip-strategies"
          title="F) Strategy toggles"
          description="auto / native / fallback + disableAnchorPositioning. Force Fallback (toolbar) overrides to fallback."
          code={`<Tooltip strategy="auto" content="Auto"><button>auto</button></Tooltip>
<Tooltip strategy="native" content="Native"><button>native</button></Tooltip>
<Tooltip strategy="fallback" content="Fallback"><button>fallback</button></Tooltip>
<Tooltip disableAnchorPositioning content="No anchor"><button>no anchor</button></Tooltip>`}
        >
          <div className="flex gap-1 flex-wrap">
            <TooltipWithDemoProps
              content="strategy: auto"
              exampleName="tooltip-auto"
              strategy={forceFallback ? "fallback" : "auto"}
              disableAnchorPositioning={forceFallback}
            >
              <button type="button">auto</button>
            </TooltipWithDemoProps>
            <TooltipWithDemoProps
              content="strategy: native"
              exampleName="tooltip-native"
              strategy={forceFallback ? "fallback" : "native"}
              disableAnchorPositioning={forceFallback}
            >
              <button type="button">native</button>
            </TooltipWithDemoProps>
            <TooltipWithDemoProps
              content="strategy: fallback"
              exampleName="tooltip-fallback"
              strategy="fallback"
            >
              <button type="button">fallback</button>
            </TooltipWithDemoProps>
            <TooltipWithDemoProps
              content="disableAnchorPositioning: true"
              exampleName="tooltip-no-anchor"
              disableAnchorPositioning={true}
              strategy={forceFallback ? "fallback" : "auto"}
            >
              <button type="button">no anchor</button>
            </TooltipWithDemoProps>
          </div>
        </ExampleCard>
      </div>

    </Section>
  );
}
