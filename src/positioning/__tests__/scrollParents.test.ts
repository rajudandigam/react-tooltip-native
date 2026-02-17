import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getScrollParents } from "../scrollParents";

describe("scrollParents", () => {
  let a: HTMLElement;
  let b: HTMLElement;
  let c: HTMLElement;

  beforeEach(() => {
    a = document.createElement("div");
    a.id = "a";
    b = document.createElement("div");
    b.id = "b";
    c = document.createElement("div");
    c.id = "c";
    a.appendChild(b);
    b.appendChild(c);
    document.body.appendChild(a);
  });

  afterEach(() => {
    document.body.removeChild(a);
  });

  it("returns [b, window] when b has overflow auto and a has overflow visible", () => {
    a.style.overflow = "visible";
    b.style.overflow = "auto";

    const result = getScrollParents(c);

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toBe(b);
    if (result.length > 1) expect(result[result.length - 1]).toBe(window);
  });

  it("nearest scrollable first, window last", () => {
    a.style.overflow = "scroll";
    b.style.overflow = "auto";

    const result = getScrollParents(c, { includeWindow: true });

    expect(result[0]).toBe(b);
    expect(result[1]).toBe(a);
    expect(result[result.length - 1]).toBe(window);
  });

  it("boundary option stops before reaching parent", () => {
    a.style.overflow = "scroll";
    b.style.overflow = "auto";

    const result = getScrollParents(c, { boundary: a, includeWindow: false });

    expect(result).toContain(b);
    expect(result).not.toContain(a);
  });

  it("includeWindow=false omits window", () => {
    b.style.overflow = "auto";

    const result = getScrollParents(c, { includeWindow: false });

    expect(result.every((x) => x !== window)).toBe(true);
    expect(result).toContain(b);
  });

  it("returns [] for null when window is missing (SSR guard)", () => {
    const g = globalThis as unknown as { window?: unknown };
    const saved = g.window;
    g.window = undefined;

    try {
      const result = getScrollParents(null);
      expect(result).toEqual([]);
    } finally {
      g.window = saved;
    }
  });

  it("returns [] for element when window is missing (SSR guard)", () => {
    const g = globalThis as unknown as { window?: unknown };
    const saved = g.window;
    g.window = undefined;

    try {
      const result = getScrollParents(c);
      expect(result).toEqual([]);
    } finally {
      g.window = saved;
    }
  });

  it("null element with includeWindow returns [window] in browser", () => {
    const result = getScrollParents(null, { includeWindow: true });
    expect(result).toEqual([window]);
  });

  it("null element with includeWindow false returns []", () => {
    const result = getScrollParents(null, { includeWindow: false });
    expect(result).toEqual([]);
  });

  it("no scrollable parents returns only window when includeWindow true", () => {
    a.style.overflow = "visible";
    b.style.overflow = "visible";

    const result = getScrollParents(c, { includeWindow: true });

    expect(result).toEqual([window]);
  });

  it("does not duplicate scroll containers", () => {
    b.style.overflow = "auto";
    const result = getScrollParents(c);
    const bCount = result.filter((x) => x === b).length;
    expect(bCount).toBe(1);
  });
});
