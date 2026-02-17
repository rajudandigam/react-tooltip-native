import { describe, expect, it } from "vitest";
import { transition } from "../stateMachine";
import type { OverlayState } from "../stateMachine";

describe("stateMachine", () => {
  describe("transition", () => {
    it("closed -> REQUEST_OPEN -> opening, shouldOpen=true", () => {
      const r = transition("closed", { type: "REQUEST_OPEN", reason: "pointer-enter" });
      expect(r.state).toBe("opening");
      expect(r.shouldOpen).toBe(true);
      expect(r.shouldClose).toBe(false);
    });

    it("closed -> REQUEST_CLOSE -> stays closed (no-op)", () => {
      const r = transition("closed", { type: "REQUEST_CLOSE", reason: "escape" });
      expect(r.state).toBe("closed");
      expect(r.shouldOpen).toBe(false);
      expect(r.shouldClose).toBe(false);
    });

    it("opening -> OPENED -> open", () => {
      const r = transition("opening", { type: "OPENED" });
      expect(r.state).toBe("open");
      expect(r.shouldOpen).toBe(false);
      expect(r.shouldClose).toBe(false);
    });

    it("opening -> REQUEST_CLOSE -> closing, shouldClose=true", () => {
      const r = transition("opening", { type: "REQUEST_CLOSE", reason: "escape" });
      expect(r.state).toBe("closing");
      expect(r.shouldOpen).toBe(false);
      expect(r.shouldClose).toBe(true);
    });

    it("opening -> REQUEST_OPEN -> stays opening (no-op)", () => {
      const r = transition("opening", { type: "REQUEST_OPEN", reason: "pointer-enter" });
      expect(r.state).toBe("opening");
      expect(r.shouldOpen).toBe(false);
      expect(r.shouldClose).toBe(false);
    });

    it("open -> REQUEST_CLOSE -> closing, shouldClose=true", () => {
      const r = transition("open", { type: "REQUEST_CLOSE", reason: "outside-press" });
      expect(r.state).toBe("closing");
      expect(r.shouldOpen).toBe(false);
      expect(r.shouldClose).toBe(true);
    });

    it("open -> REQUEST_OPEN -> stays open (no-op)", () => {
      const r = transition("open", { type: "REQUEST_OPEN", reason: "pointer-enter" });
      expect(r.state).toBe("open");
      expect(r.shouldOpen).toBe(false);
      expect(r.shouldClose).toBe(false);
    });

    it("closing -> CLOSED -> closed", () => {
      const r = transition("closing", { type: "CLOSED" });
      expect(r.state).toBe("closed");
      expect(r.shouldOpen).toBe(false);
      expect(r.shouldClose).toBe(false);
    });

    it("closing -> REQUEST_OPEN -> opening, shouldOpen=true", () => {
      const r = transition("closing", { type: "REQUEST_OPEN", reason: "pointer-enter" });
      expect(r.state).toBe("opening");
      expect(r.shouldOpen).toBe(true);
      expect(r.shouldClose).toBe(false);
    });

    it("closing -> REQUEST_CLOSE -> stays closing (no-op)", () => {
      const r = transition("closing", { type: "REQUEST_CLOSE", reason: "escape" });
      expect(r.state).toBe("closing");
      expect(r.shouldOpen).toBe(false);
      expect(r.shouldClose).toBe(false);
    });

    it("full cycle: closed -> opening -> open -> closing -> closed", () => {
      let state: OverlayState = "closed";
      let r = transition(state, { type: "REQUEST_OPEN", reason: "pointer-enter" });
      state = r.state;
      expect(state).toBe("opening");

      r = transition(state, { type: "OPENED" });
      state = r.state;
      expect(state).toBe("open");

      r = transition(state, { type: "REQUEST_CLOSE", reason: "pointer-leave" });
      state = r.state;
      expect(state).toBe("closing");

      r = transition(state, { type: "CLOSED" });
      state = r.state;
      expect(state).toBe("closed");
    });

    it("open request while closing switches to opening with shouldOpen=true", () => {
      const r = transition("closing", { type: "REQUEST_OPEN", reason: "click" });
      expect(r.state).toBe("opening");
      expect(r.shouldOpen).toBe(true);
      expect(r.shouldClose).toBe(false);
    });

    it("close request while opening switches to closing with shouldClose=true", () => {
      const r = transition("opening", { type: "REQUEST_CLOSE", reason: "blur" });
      expect(r.state).toBe("closing");
      expect(r.shouldOpen).toBe(false);
      expect(r.shouldClose).toBe(true);
    });
  });
});
