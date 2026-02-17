import { describe, expect, it } from "vitest";
import {
  ANCHOR_PREFIX,
  makeAnchorName,
  withAnchorNameStyle,
  withPositionAnchorStyle,
} from "../anchorInjection";

describe("anchorInjection", () => {
  describe("ANCHOR_PREFIX", () => {
    it("is --rt-", () => {
      expect(ANCHOR_PREFIX).toBe("--rt-");
    });
  });

  describe("makeAnchorName", () => {
    it("removes : from id (React useId)", () => {
      expect(makeAnchorName(":r1:")).toBe("--rt-r1");
      expect(makeAnchorName("abc:def")).toBe("--rt-abcdef");
    });

    it("replaces spaces with -", () => {
      expect(makeAnchorName("a b")).toBe("--rt-a-b");
      expect(makeAnchorName("  x  y  ")).toBe("--rt-x-y");
    });

    it("produces fallback for empty string", () => {
      expect(makeAnchorName("")).toBe("--rt-anchor");
    });

    it("produces fallback when id is only colons/spaces", () => {
      expect(makeAnchorName(":")).toBe("--rt-anchor");
      expect(makeAnchorName("   ")).toBe("--rt-anchor");
      expect(makeAnchorName("::")).toBe("--rt-anchor");
    });

    it("keeps valid id unchanged except prefix", () => {
      expect(makeAnchorName("foo")).toBe("--rt-foo");
      expect(makeAnchorName("id-123")).toBe("--rt-id-123");
    });
  });

  describe("withAnchorNameStyle", () => {
    it("merges without mutating input", () => {
      const props = { style: { color: "red" } };
      const result = withAnchorNameStyle(props, "--rt-trigger");
      expect(result).not.toBe(props);
      expect(result.style).not.toBe(props.style);
      expect(props.style).toEqual({ color: "red" });
      expect(result.style).toEqual({ color: "red", anchorName: "--rt-trigger" });
    });

    it("preserves existing style keys", () => {
      const props = { style: { margin: 8, padding: 4 } };
      const result = withAnchorNameStyle(props, "--rt-x");
      expect(result.style).toEqual({ margin: 8, padding: 4, anchorName: "--rt-x" });
    });

    it("anchorName overrides if already present", () => {
      const props = { style: { anchorName: "--old" } };
      const result = withAnchorNameStyle(props, "--rt-new");
      expect(result.style?.anchorName).toBe("--rt-new");
    });

    it("handles props without style", () => {
      const props = { className: "btn" };
      const result = withAnchorNameStyle(props, "--rt-trigger");
      expect(result.style).toEqual({ anchorName: "--rt-trigger" });
      expect(result.className).toBe("btn");
    });

    it("handles empty style object", () => {
      const props = { style: {} };
      const result = withAnchorNameStyle(props, "--rt-x");
      expect(result.style).toEqual({ anchorName: "--rt-x" });
    });
  });

  describe("withPositionAnchorStyle", () => {
    it("merges without mutating input", () => {
      const props = { style: { zIndex: 1 } };
      const result = withPositionAnchorStyle(props, "--rt-overlay");
      expect(result).not.toBe(props);
      expect(props.style).toEqual({ zIndex: 1 });
      expect(result.style).toEqual({ zIndex: 1, positionAnchor: "--rt-overlay" });
    });

    it("preserves existing style keys", () => {
      const props = { style: { position: "fixed" } };
      const result = withPositionAnchorStyle(props, "--rt-x");
      expect(result.style).toEqual({ position: "fixed", positionAnchor: "--rt-x" });
    });

    it("positionAnchor overrides if already present", () => {
      const props = { style: { positionAnchor: "--old" } };
      const result = withPositionAnchorStyle(props, "--rt-new");
      expect(result.style?.positionAnchor).toBe("--rt-new");
    });
  });
});
