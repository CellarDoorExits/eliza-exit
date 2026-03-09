import type { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";

/** Sanitize a string for safe injection into LLM context. */
function sanitize(value: unknown, maxLen = 64): string {
  const s = String(value ?? "unknown")
    .replace(/[\n\r\t]/g, " ")     // strip newlines/tabs
    .replace(/[^\x20-\x7E]/g, "")  // ASCII printable only
    .slice(0, maxLen);
  return s || "unknown";
}

export const exitHistoryProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, _state?: State): Promise<string> => {
    // Query Eliza's memory system for EXIT markers in this room
    const memories = await runtime.messageManager.getMemories({
      roomId: message.roomId,
      count: 50,
    });

    const exitMemories = memories.filter(
      (m: Memory) => m.content?.markerId && m.content?.exitMarker,
    );

    if (exitMemories.length === 0) {
      return "No EXIT markers have been created in this conversation.";
    }

    const recent = exitMemories.slice(-10);
    const lines = recent.map((m: Memory, i: number) => {
      const c = m.content;
      return `${i + 1}. [${sanitize(c.markerId, 80)}] origin=${sanitize(c.origin)} type=${sanitize(c.exitType)}`;
    });

    return `Recent EXIT markers (${exitMemories.length} total, showing last ${recent.length}):\n${lines.join("\n")}`;
  },
};
