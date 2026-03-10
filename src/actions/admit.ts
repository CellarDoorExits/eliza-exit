import { quickEntry, type QuickEntryResult } from "cellar-door-entry";
import type { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

/**
 * Extract JSON from message text — prefers fenced code blocks, then balanced braces.
 */
function extractJson(text: string): string | undefined {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch?.[1]) return codeBlockMatch[1].trim();

  const start = text.indexOf("{");
  if (start !== -1) {
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return undefined;
}

/** Sanitize a string for safe storage / display. */
function sanitize(raw: string, maxLen = 64): string {
  return raw
    .replace(/[\n\r\t]/g, "")
    .replace(/[^\w.-]/g, "")
    .slice(0, maxLen) || "unknown";
}

export const admitExitAction: Action = {
  name: "ADMIT_EXIT_MARKER",
  similes: [
    "PROCESS_ARRIVAL",
    "ACCEPT_AGENT",
    "WELCOME_AGENT",
    "PROCESS_ENTRY",
  ],
  description:
    "Verify and admit an agent presenting an EXIT marker, creating an arrival record.",

  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text ?? "").toLowerCase();
    const hasAdmitKeyword =
      text.includes("admit") ||
      text.includes("accept") ||
      text.includes("arrival") ||
      text.includes("entry") ||
      text.includes("welcome");
    const hasMarkerKeyword =
      text.includes("marker") ||
      text.includes("exit") ||
      text.includes("departure") ||
      text.includes("agent");
    return hasAdmitKeyword && hasMarkerKeyword;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown> | undefined,
    callback?: HandlerCallback,
  ): Promise<boolean> => {
    const text = message.content?.text ?? "";
    const jsonStr = extractJson(text);

    if (!jsonStr) {
      if (callback) {
        callback({
          text: "Please provide an EXIT marker as JSON to process admission. You can paste it directly or wrap it in a code block.",
          content: { error: "No JSON found in message" },
        });
      }
      return false;
    }

    try {
      // Use this platform's identity as the destination
      const destination = `eliza:${runtime.agentId}`;
      const result: QuickEntryResult = quickEntry(jsonStr, destination);

      const arrival = result.arrivalMarker;
      const exit = result.exitMarker;

      // Store the arrival marker in Eliza memory (matching the pattern from history.ts)
      await runtime.messageManager.createMemory({
        id: crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`,
        userId: message.userId,
        agentId: runtime.agentId,
        roomId: message.roomId,
        content: {
          text: `ARRIVAL marker: ${arrival.id} from ${sanitize(arrival.departureOrigin)}`,
          arrivalMarker: JSON.stringify(arrival),
          markerId: arrival.id,
          departureRef: arrival.departureRef,
          origin: sanitize(arrival.departureOrigin),
          destination: sanitize(arrival.destination),
          admissionType: arrival.admissionType,
          subject: arrival.subject,
        },
      });

      if (callback) {
        const continuityStatus = result.continuity.valid
          ? "✅ Continuity verified"
          : `❌ Continuity errors: ${result.continuity.errors.join(", ")}`;

        callback({
          text: [
            `**Agent admitted successfully.**`,
            ``,
            `**Arrival ID:** ${arrival.id}`,
            `**Subject:** ${arrival.subject}`,
            `**From:** ${arrival.departureOrigin}`,
            `**Departure Ref:** ${arrival.departureRef}`,
            `**Admission Type:** ${arrival.admissionType}`,
            `**Verification:** ${arrival.verificationResult.valid ? "✅ Valid" : "❌ Invalid"}`,
            `**Continuity:** ${continuityStatus}`,
          ].join("\n"),
          content: {
            arrivalMarker: arrival,
            exitMarker: exit,
            continuity: result.continuity,
          },
        });
      }

      return true;
    } catch (error) {
      if (callback) {
        callback({
          text: `Failed to admit agent: ${(error as Error).message}`,
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
        content: { text: 'Admit this agent with their EXIT marker: {"@context":"https://exit.pub/v1"...}' },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Agent admitted successfully.",
          action: "ADMIT_EXIT_MARKER",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Process this arrival entry marker" },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Please provide an EXIT marker as JSON to process admission.",
          action: "ADMIT_EXIT_MARKER",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: 'Welcome this agent: ```json\n{"@context":"https://exit.pub/v1","subject":"did:key:z6Mk..."}\n```',
        },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Agent admitted successfully.",
          action: "ADMIT_EXIT_MARKER",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Accept this agent's exit marker for entry" },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Please provide an EXIT marker as JSON to process admission.",
          action: "ADMIT_EXIT_MARKER",
        },
      },
    ],
  ],
};
