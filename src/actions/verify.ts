import { quickVerify } from "cellar-door-exit";
import type { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

export const verifyExitAction: Action = {
  name: "VERIFY_EXIT_MARKER",
  similes: [
    "CHECK_EXIT_MARKER",
    "VALIDATE_DEPARTURE",
    "VERIFY_DEPARTURE_RECORD",
  ],
  description:
    "Verify a cryptographically signed EXIT marker to confirm its authenticity and integrity.",

  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text ?? "").toLowerCase();
    return (
      (text.includes("verify") || text.includes("check") || text.includes("validate")) &&
      (text.includes("exit") || text.includes("marker") || text.includes("departure"))
    );
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown> | undefined,
    callback?: HandlerCallback,
  ): Promise<boolean> => {
    const text = message.content?.text ?? "";

    // Extract JSON: prefer fenced code blocks, then find balanced braces
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    let jsonStr: string | undefined;

    if (codeBlockMatch?.[1]) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      // Find the first `{` and match to its balanced `}`
      const start = text.indexOf("{");
      if (start !== -1) {
        let depth = 0;
        for (let i = start; i < text.length; i++) {
          if (text[i] === "{") depth++;
          else if (text[i] === "}") depth--;
          if (depth === 0) {
            jsonStr = text.slice(start, i + 1);
            break;
          }
        }
      }
    }

    if (!jsonStr) {
      if (callback) {
        callback({
          text: "Please provide an EXIT marker as JSON to verify. You can paste it directly or wrap it in a code block.",
          content: { error: "No JSON found in message" },
        });
      }
      return false;
    }

    try {
      const result = quickVerify(jsonStr);

      if (callback) {
        if (result.valid) {
          callback({
            text: `✅ **EXIT marker verified successfully.**\n\nThe marker's cryptographic signature is valid and the structure is well-formed.`,
            content: { valid: true, result },
          });
        } else {
          callback({
            text: `❌ **EXIT marker verification failed.**\n\nErrors:\n${(result.errors ?? []).map((e: string) => `- ${e}`).join("\n")}`,
            content: { valid: false, errors: result.errors },
          });
        }
      }

      return true;
    } catch (error) {
      if (callback) {
        callback({
          text: `Failed to verify EXIT marker: ${(error as Error).message}`,
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
        content: { text: 'Verify this EXIT marker: {"@context":"https://exit.pub/v1"...}' },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "EXIT marker verified successfully.",
          action: "VERIFY_EXIT_MARKER",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Check this departure record" },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Please provide an EXIT marker as JSON to verify.",
          action: "VERIFY_EXIT_MARKER",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Can you validate this exit marker for me?" },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Please provide an EXIT marker as JSON to verify.",
          action: "VERIFY_EXIT_MARKER",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: 'Verify this departure: ```json\n{"@context":"https://exit.pub/v1","subject":"did:key:z6Mk..."}\n```',
        },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "EXIT marker verified successfully.",
          action: "VERIFY_EXIT_MARKER",
        },
      },
    ],
  ],
};
