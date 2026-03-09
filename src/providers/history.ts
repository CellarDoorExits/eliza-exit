import type { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";

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
      return `${i + 1}. [${c.markerId}] origin=${c.origin} type=${c.exitType}`;
    });

    return `Recent EXIT markers (${exitMemories.length} total, showing last ${recent.length}):\n${lines.join("\n")}`;
  },
};
