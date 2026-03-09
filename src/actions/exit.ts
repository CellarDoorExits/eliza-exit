import { quickExit, toJSON, type QuickExitResult } from "cellar-door-exit";
import type { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

export const exitAction: Action = {
  name: "CREATE_EXIT_MARKER",
  similes: [
    "RECORD_DEPARTURE",
    "LEAVE_PLATFORM",
    "EXIT_PLATFORM",
    "CREATE_DEPARTURE_RECORD",
  ],
  description:
    "Create a cryptographically signed EXIT marker recording the agent's departure from a platform or context.",

  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text ?? "").toLowerCase();
    return (
      text.includes("exit") ||
      text.includes("depart") ||
      text.includes("leave") ||
      text.includes("departure")
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options: Record<string, unknown> | undefined,
    callback?: HandlerCallback,
  ): Promise<boolean> => {
    const text = message.content?.text ?? "";

    // Extract origin from message or use a default
    const originMatch = text.match(/(?:from|platform|origin)\s+["']?([^\s"']+)["']?/i);
    const origin = originMatch?.[1] ?? "unknown-platform";

    try {
      const result: QuickExitResult = await quickExit(origin);
      const markerJson = toJSON(result.marker);

      // Store in runtime memory for the history provider
      const markers: QuickExitResult[] =
        (runtime as any).__exitMarkers ?? [];
      markers.push(result);
      (runtime as any).__exitMarkers = markers;

      if (callback) {
        callback({
          text: `EXIT marker created successfully.\n\n**Marker ID:** ${result.marker.id}\n**Subject:** ${result.marker.subject}\n**Origin:** ${origin}\n**Exit Type:** ${result.marker.exitType}\n\n\`\`\`json\n${markerJson}\n\`\`\``,
          content: { marker: result.marker, identity: { did: result.identity.did } },
        });
      }

      return true;
    } catch (error) {
      if (callback) {
        callback({
          text: `Failed to create EXIT marker: ${(error as Error).message}`,
          content: { error: (error as Error).message },
        });
      }
      return false;
    }
  },

  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "Create an EXIT marker for leaving Twitter" },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "EXIT marker created successfully.",
          action: "CREATE_EXIT_MARKER",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Record my departure from this platform" },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "EXIT marker created successfully.",
          action: "CREATE_EXIT_MARKER",
        },
      },
    ],
  ],
};
