import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectSupports } from "../featureDetection";

describe("featureDetection", () => {
  const g = globalThis as unknown as {
    HTMLElement?: unknown;
    CSS?: unknown;
  };

  let savedHTMLElement: unknown;
  let savedCSS: unknown;

  afterEach(() => {
    g.HTMLElement = savedHTMLElement;
    g.CSS = savedCSS;
    vi.restoreAllMocks();
  });

  describe("detectSupports", () => {
    it("returns popover:false and anchorPositioning:false in SSR-like env (no HTMLElement/CSS)", () => {
      savedHTMLElement = g.HTMLElement;
      savedCSS = g.CSS;
      g.HTMLElement = undefined;
      g.CSS = undefined;

      const result = detectSupports();

      expect(result).toEqual({ popover: false, anchorPositioning: false });
    });

    it("returns popover:true when HTMLElement has showPopover on prototype", () => {
      savedHTMLElement = g.HTMLElement;
      savedCSS = g.CSS;

      const FakeHTMLElement = function (this: void) {} as unknown as typeof HTMLElement;
      (FakeHTMLElement as unknown as { prototype: { showPopover?: () => void } }).prototype = {
        showPopover: vi.fn(),
      };
      g.HTMLElement = FakeHTMLElement;
      g.CSS = undefined;

      const result = detectSupports();

      expect(result.popover).toBe(true);
      expect(result.anchorPositioning).toBe(false);
    });

    it("returns anchorPositioning:true when CSS.supports returns true for position-anchor", () => {
      savedHTMLElement = g.HTMLElement;
      savedCSS = g.CSS;

      g.CSS = {
        supports: (property: string) => property === "position-anchor: --x",
      };

      const result = detectSupports();

      expect(result.anchorPositioning).toBe(true);
    });

    it("returns anchorPositioning:false when CSS exists but supports is missing (no throw)", () => {
      savedHTMLElement = g.HTMLElement;
      savedCSS = g.CSS;

      g.CSS = {};

      const result = detectSupports();

      expect(result.anchorPositioning).toBe(false);
    });

    it("does not throw when HTMLElement is undefined", () => {
      savedHTMLElement = g.HTMLElement;
      savedCSS = g.CSS;
      g.HTMLElement = undefined;

      expect(() => detectSupports()).not.toThrow();
    });
  });
});
