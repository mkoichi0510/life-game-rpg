import { describe, expect, it } from "vitest";
import { exactMatch, prefixMatch } from "../nav-utils";

describe("exactMatch", () => {
  it("returns true when path exactly matches target", () => {
    expect(exactMatch("/", "/")).toBe(true);
    expect(exactMatch("/play", "/play")).toBe(true);
    expect(exactMatch("/skills/tree", "/skills/tree")).toBe(true);
  });

  it("returns false when path does not exactly match target", () => {
    expect(exactMatch("/play", "/")).toBe(false);
    expect(exactMatch("/", "/play")).toBe(false);
    expect(exactMatch("/play/123", "/play")).toBe(false);
  });

  it("handles empty strings", () => {
    expect(exactMatch("", "")).toBe(true);
    expect(exactMatch("", "/")).toBe(false);
    expect(exactMatch("/", "")).toBe(false);
  });
});

describe("prefixMatch", () => {
  it("returns true when path starts with prefix", () => {
    expect(prefixMatch("/play", "/play")).toBe(true);
    expect(prefixMatch("/play/123", "/play")).toBe(true);
    expect(prefixMatch("/skills/tree/node", "/skills")).toBe(true);
  });

  it("returns false when path does not start with prefix", () => {
    expect(prefixMatch("/", "/play")).toBe(false);
    expect(prefixMatch("/result", "/play")).toBe(false);
    expect(prefixMatch("/player", "/play/")).toBe(false);
  });

  it("handles root path correctly", () => {
    expect(prefixMatch("/", "/")).toBe(true);
    expect(prefixMatch("/play", "/")).toBe(true);
  });

  it("handles empty strings", () => {
    expect(prefixMatch("", "")).toBe(true);
    expect(prefixMatch("/play", "")).toBe(true);
    expect(prefixMatch("", "/")).toBe(false);
  });
});
