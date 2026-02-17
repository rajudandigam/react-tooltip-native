import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInteractionManager } from "../interactionManager";
import type { InteractionRequest } from "../interactionManager";

describe("interactionManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("tooltip", () => {
    it("pointer enter trigger schedules OPEN after openDelayMs with reason pointer-enter", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onPointerEnterTrigger();
      expect(requests).toHaveLength(0);
      vi.advanceTimersByTime(99);
      expect(requests).toHaveLength(0);
      vi.advanceTimersByTime(1);
      expect(requests).toHaveLength(1);
      expect(requests[0]).toEqual({ type: "OPEN_REQUEST", reason: "pointer-enter" });

      mgr.destroy();
    });

    it("pointer leave trigger schedules CLOSE after closeDelayMs", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onPointerLeaveTrigger();
      expect(requests).toHaveLength(0);
      vi.advanceTimersByTime(50);
      expect(requests).toHaveLength(1);
      expect(requests[0]).toEqual({ type: "CLOSE_REQUEST", reason: "pointer-leave" });

      mgr.destroy();
    });

    it("hoverableContent=true: pointer leave trigger schedules close, pointer enter overlay cancels close", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: true,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onPointerLeaveTrigger();
      vi.advanceTimersByTime(25);
      mgr.onPointerEnterOverlay();
      vi.advanceTimersByTime(50);
      expect(requests).toHaveLength(0);
      mgr.destroy();
    });

    it("hoverableContent=true: pointer leave overlay schedules close after closeDelayMs", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: true,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onPointerLeaveOverlay();
      expect(requests).toHaveLength(0);
      vi.advanceTimersByTime(50);
      expect(requests).toHaveLength(1);
      expect(requests[0]).toEqual({ type: "CLOSE_REQUEST", reason: "pointer-leave" });
      mgr.destroy();
    });

    it("escape triggers CLOSE immediately when dismissOnEsc=true", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onKeyDownEscape();
      expect(requests).toHaveLength(1);
      expect(requests[0]).toEqual({ type: "CLOSE_REQUEST", reason: "escape" });
      mgr.destroy();
    });

    it("escape does not fire CLOSE when dismissOnEsc=false", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: false,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onKeyDownEscape();
      expect(requests).toHaveLength(0);
      mgr.destroy();
    });

    it("destroy cancels timers (no requests fired after destroy)", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onPointerEnterTrigger();
      mgr.destroy();
      vi.advanceTimersByTime(200);
      expect(requests).toHaveLength(0);
    });

    it("focus trigger fires OPEN immediately (no delay)", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 500,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onFocusTrigger();
      expect(requests).toHaveLength(1);
      expect(requests[0]).toEqual({ type: "OPEN_REQUEST", reason: "focus" });
      mgr.destroy();
    });

    it("blur trigger schedules CLOSE after closeDelayMs", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 100,
          closeDelayMs: 60,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onBlurTrigger();
      expect(requests).toHaveLength(0);
      vi.advanceTimersByTime(60);
      expect(requests).toHaveLength(1);
      expect(requests[0]).toEqual({ type: "CLOSE_REQUEST", reason: "blur" });
      mgr.destroy();
    });

    it("click trigger is no-op for tooltip", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "tooltip",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onClickTrigger();
      expect(requests).toHaveLength(0);
      mgr.destroy();
    });
  });

  describe("popover", () => {
    it("click trigger fires TOGGLE immediately", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "popover",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onClickTrigger();
      expect(requests).toHaveLength(1);
      expect(requests[0]).toEqual({ type: "TOGGLE_REQUEST", reason: "click" });
      mgr.destroy();
    });

    it("escape triggers CLOSE when dismissOnEsc=true", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "popover",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onKeyDownEscape();
      expect(requests).toHaveLength(1);
      expect(requests[0]).toEqual({ type: "CLOSE_REQUEST", reason: "escape" });
      mgr.destroy();
    });

    it("hover and focus handlers do nothing for popover", () => {
      const requests: InteractionRequest[] = [];
      const mgr = createInteractionManager({
        config: {
          kind: "popover",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: (req) => requests.push(req),
      });

      mgr.onPointerEnterTrigger();
      mgr.onPointerLeaveTrigger();
      mgr.onPointerEnterOverlay();
      mgr.onPointerLeaveOverlay();
      mgr.onFocusTrigger();
      mgr.onBlurTrigger();
      vi.advanceTimersByTime(500);
      expect(requests).toHaveLength(0);
      mgr.destroy();
    });

    it("destroy is safe (no throw)", () => {
      const mgr = createInteractionManager({
        config: {
          kind: "popover",
          openDelayMs: 100,
          closeDelayMs: 50,
          hoverableContent: false,
          dismissOnEsc: true,
        },
        onRequest: () => {},
      });
      expect(() => mgr.destroy()).not.toThrow();
      expect(() => mgr.destroy()).not.toThrow();
    });
  });
});
