import { describe, it, expect } from "vitest";
import { exitAction } from "../actions/exit.js";
import { verifyExitAction } from "../actions/verify.js";
import { admitExitAction } from "../actions/admit.js";
import { counterSignExitAction } from "../actions/countersign.js";
import type { IAgentRuntime, Memory } from "@elizaos/core";

// Minimal mock runtime — validate functions only use message, not runtime
const mockRuntime = {} as IAgentRuntime;

function mem(text: string): Memory {
  return { content: { text } } as unknown as Memory;
}

describe("exitAction.validate", () => {
  const v = (text: string) => exitAction.validate(mockRuntime, mem(text), undefined as any);

  it("matches 'create exit marker'", async () => {
    expect(await v("create an exit marker for Twitter")).toBe(true);
  });

  it("matches 'exit protocol'", async () => {
    expect(await v("use exit protocol")).toBe(true);
  });

  it("matches 'departure record'", async () => {
    expect(await v("departure record please")).toBe(true);
  });

  it("matches 'record departure'", async () => {
    expect(await v("record my departure")).toBe(true);
  });

  it("matches 'create exit'", async () => {
    expect(await v("create exit for Discord")).toBe(true);
  });

  it("does not match unrelated text", async () => {
    expect(await v("hello world")).toBe(false);
    expect(await v("what is the weather")).toBe(false);
  });
});

describe("verifyExitAction.validate", () => {
  const v = (text: string) => verifyExitAction.validate(mockRuntime, mem(text), undefined as any);

  it("matches 'verify exit marker'", async () => {
    expect(await v("verify this exit marker")).toBe(true);
  });

  it("matches 'check departure'", async () => {
    expect(await v("check this departure")).toBe(true);
  });

  it("matches 'validate marker'", async () => {
    expect(await v("validate this marker")).toBe(true);
  });

  it("does not match unrelated text", async () => {
    expect(await v("create exit marker")).toBe(false);
    expect(await v("hello")).toBe(false);
  });
});

describe("admitExitAction.validate", () => {
  const v = (text: string) => admitExitAction.validate(mockRuntime, mem(text), undefined as any);

  it("matches 'admit agent with marker'", async () => {
    expect(await v("admit this agent with their exit marker")).toBe(true);
  });

  it("matches 'accept exit'", async () => {
    expect(await v("accept this exit")).toBe(true);
  });

  it("matches 'welcome agent'", async () => {
    expect(await v("welcome this agent")).toBe(true);
  });

  it("matches 'process arrival marker'", async () => {
    expect(await v("process arrival marker")).toBe(true);
  });

  it("does not match unrelated text", async () => {
    expect(await v("verify exit marker")).toBe(false);
    expect(await v("hello")).toBe(false);
  });
});

describe("counterSignExitAction.validate", () => {
  const v = (text: string) => counterSignExitAction.validate(mockRuntime, mem(text), undefined as any);

  it("matches 'countersign exit marker'", async () => {
    expect(await v("countersign this exit marker")).toBe(true);
  });

  it("matches 'witness departure'", async () => {
    expect(await v("witness this departure")).toBe(true);
  });

  it("matches 'attest exit'", async () => {
    expect(await v("attest this exit")).toBe(true);
  });

  it("does not match unrelated text", async () => {
    expect(await v("verify exit marker")).toBe(false);
    expect(await v("create exit")).toBe(false);
  });
});

describe("handlers are functions", () => {
  it("exitAction.handler", () => expect(typeof exitAction.handler).toBe("function"));
  it("verifyExitAction.handler", () => expect(typeof verifyExitAction.handler).toBe("function"));
  it("admitExitAction.handler", () => expect(typeof admitExitAction.handler).toBe("function"));
  it("counterSignExitAction.handler", () => expect(typeof counterSignExitAction.handler).toBe("function"));
});
