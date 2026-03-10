import { describe, it, expect } from "vitest";
import { exitPlugin } from "../index.js";

describe("exitPlugin", () => {
  it("exports a valid plugin object", () => {
    expect(exitPlugin).toBeDefined();
    expect(exitPlugin.name).toBe("exit-protocol");
    expect(typeof exitPlugin.description).toBe("string");
    expect(exitPlugin.description.length).toBeGreaterThan(0);
    expect(Array.isArray(exitPlugin.actions)).toBe(true);
    expect(Array.isArray(exitPlugin.providers)).toBe(true);
  });

  it("has 4 actions", () => {
    expect(exitPlugin.actions!.length).toBe(4);
  });

  it("has 1 provider", () => {
    expect(exitPlugin.providers!.length).toBe(1);
  });

  describe("each action", () => {
    for (const action of exitPlugin.actions!) {
      describe(action.name, () => {
        it("has required fields", () => {
          expect(typeof action.name).toBe("string");
          expect(typeof action.description).toBe("string");
          expect(typeof action.validate).toBe("function");
          expect(typeof action.handler).toBe("function");
          expect(Array.isArray(action.similes)).toBe(true);
          expect(Array.isArray(action.examples)).toBe(true);
        });

        it("has an UPPERCASE name (Eliza convention)", () => {
          expect(action.name).toBe(action.name.toUpperCase());
        });

        it("has non-empty similes", () => {
          expect(action.similes!.length).toBeGreaterThan(0);
        });

        it("has non-empty examples", () => {
          expect(action.examples!.length).toBeGreaterThan(0);
        });
      });
    }
  });

  it("has no duplicate action names", () => {
    const names = exitPlugin.actions!.map((a) => a.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("exports expected action names", () => {
    const names = exitPlugin.actions!.map((a) => a.name);
    expect(names).toContain("CREATE_EXIT_MARKER");
    expect(names).toContain("VERIFY_EXIT_MARKER");
    expect(names).toContain("ADMIT_EXIT_MARKER");
    expect(names).toContain("COUNTERSIGN_EXIT_MARKER");
  });

  it("provider has a get function", () => {
    for (const provider of exitPlugin.providers!) {
      expect(typeof provider.get).toBe("function");
    }
  });
});
