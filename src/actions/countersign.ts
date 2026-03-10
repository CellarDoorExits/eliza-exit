import {
  fromJSON,
  toJSON,
  generateIdentity,
  sign,
  type ExitMarker,
  type WitnessAttachment,
} from "cellar-door-exit";
import type { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";

export const counterSignExitAction: Action = {
  name: "COUNTERSIGN_EXIT_MARKER",
  similes: [
    "WITNESS_EXIT_MARKER",
    "SIGN_AS_WITNESS",
    "ATTEST_DEPARTURE",
  ],
  description:
    "Counter-sign an EXIT marker as a witness, adding a cryptographic attestation that you observed the departure.",

  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = (message.content?.text ?? "").toLowerCase();
    return (
      (text.includes("countersign") || text.includes("counter-sign") ||
       text.includes("witness") || text.includes("attest")) &&
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

    // Extract JSON from message
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    let jsonStr: string | undefined;

    if (codeBlockMatch?.[1]) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
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
          text: "Please provide an EXIT marker as JSON to counter-sign. You can paste it directly or wrap it in a code block.",
          content: { error: "No JSON found in message" },
        });
      }
      return false;
    }

    try {
      const marker = fromJSON(jsonStr) as ExitMarker;
      const identity = generateIdentity();
      const attestation = "Observed departure ceremony";
      const ts = new Date().toISOString();

      const payload = new TextEncoder().encode(attestation + marker.id + ts);
      const sig = sign(payload, identity.privateKey);

      const witness: WitnessAttachment = {
        witnessDid: identity.did,
        attestation,
        timestamp: ts,
        signature: Buffer.from(sig).toString("base64"),
        signatureType: "Ed25519Signature2020",
      };

      const updated = { ...marker, witnesses: [...(((marker as any).witnesses) ?? []), witness] };
      const updatedJson = toJSON(updated as ExitMarker);

      if (callback) {
        const maxJsonLen = 1200;
        const jsonDisplay = updatedJson.length > maxJsonLen
          ? updatedJson.slice(0, maxJsonLen) + "\n... (truncated)"
          : updatedJson;

        callback({
          text: `✅ **EXIT marker counter-signed as witness.**\n\n**Witness DID:** ${identity.did}\n**Attestation:** ${attestation}\n**Marker ID:** ${marker.id}\n\n\`\`\`json\n${jsonDisplay}\n\`\`\``,
          content: { witnessDid: identity.did, markerId: marker.id },
        });
      }

      return true;
    } catch (error) {
      if (callback) {
        callback({
          text: `Failed to counter-sign EXIT marker: ${(error as Error).message}`,
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
        content: { text: 'Countersign this EXIT marker: {"@context":"https://exit.pub/v1"...}' },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "EXIT marker counter-signed as witness.",
          action: "COUNTERSIGN_EXIT_MARKER",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Witness this departure record for me" },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Please provide an EXIT marker as JSON to counter-sign.",
          action: "COUNTERSIGN_EXIT_MARKER",
        },
      },
    ],
  ],
};
