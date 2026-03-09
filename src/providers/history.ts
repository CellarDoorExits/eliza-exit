import type { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import type { QuickExitResult } from "cellar-door-exit";

export const exitHistoryProvider: Provider = {
  get: async (runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<string> => {
    const markers: QuickExitResult[] = (runtime as any).__exitMarkers ?? [];

    if (markers.length === 0) {
      return "No EXIT markers have been created in this session.";
    }

    const recent = markers.slice(-10);
    const lines = recent.map((r, i) => {
      const m = r.marker;
      return `${i + 1}. [${m.id}] origin=${m.origin} type=${m.exitType} status=${m.status ?? "unknown"} timestamp=${m.timestamp}`;
    });

    return `Recent EXIT markers (${markers.length} total, showing last ${recent.length}):\n${lines.join("\n")}`;
  },
};
