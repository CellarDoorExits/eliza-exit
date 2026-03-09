import { quickExit, toJSON, type QuickExitResult } from "cellar-door-exit";
import type { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

/**
 * Extract the platform/origin from user text.
 * Matches patterns like:
 *   "leaving Twitter" / "exit from Discord" / "departure from 'My Server'"
 *   "platform: Slack" / "origin is Mastodon"
 * Falls back to "unknown-platform" if nothing found.
 */
function extractOrigin(text: string): string {
  const patterns = [
    // "from <platform>" / "leaving <platform>"
    /(?:from|leaving|exiting|departing)\s+["']?(\w[\w.-]+)["']?/i,
    // "platform: <value>" or "origin: <value>"
    /(?:platform|origin)[\s:]+["']?(\w[\w.-]+)["']?/i,
    // "for <platform>" (as in "create an exit marker for Twitter")
    /(?:marker|record|departure)\s+(?:for|on)\s+["']?(\w[\w.-]+)["']?/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const val = m[1].toLowerCase();
      // Filter out noise words that aren't platforms
      if (!["this", "the", "my", "a", "an", "that", "here"].includes(val)) {
        return m[1];
      }
    }
  }
  return "unknown-platform";
}

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
    const hasExitKeyword =
      text.includes("exit marker") ||
      text.includes("departure record") ||
      text.includes("exit protocol");
    const hasActionKeyword =
      (text.includes("exit") || text.includes("depart") || text.includes("departure")) &&
      (text.includes("create") || text.includes("record") || text.includes("make") || text.includes("generate"));
    const hasLeaveKeyword =
      text.includes("leave") &&
      (text.includes("marker") || text.includes("record") || text.includes("platform"));
    return hasExitKeyword || hasActionKeyword || hasLeaveKeyword;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown> | undefined,
    callback?: HandlerCallback,
  ): Promise<boolean> => {
    const text = message.content?.text ?? "";
    const origin = extractOrigin(text);

    try {
      const result: QuickExitResult = await quickExit(origin);
      const markerJson = toJSON(result.marker);

      // Store marker in Eliza's memory system for persistence and user isolation
      await runtime.messageManager.createMemory({
        id: crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`,
        userId: message.userId,
        agentId: runtime.agentId,
        roomId: message.roomId,
        content: {
          text: `EXIT marker: ${result.marker.id} from ${origin}`,
          exitMarker: markerJson,
          markerId: result.marker.id,
          origin,
          exitType: result.marker.exitType,
        },
      });

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
    [
      {
        user: "{{user1}}",
        content: { text: "I need to create a departure record for Discord" },
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
        content: { text: "Generate an exit marker — I'm leaving Mastodon" },
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
        content: { text: "Make an EXIT protocol record for departing from Slack" },
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
