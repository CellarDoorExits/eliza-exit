# @cellar-door/eliza 𓉸

[![npm](https://img.shields.io/npm/v/@cellar-door/eliza)](https://www.npmjs.com/package/@cellar-door/eliza)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE)

> **[𓉸 Passage Protocol](https://cellar-door.dev)** · [exit-door](https://github.com/CellarDoorExits/exit-door) · [entry-door](https://github.com/CellarDoorExits/entry-door) · [mcp](https://github.com/CellarDoorExits/mcp-server) · [langchain](https://github.com/CellarDoorExits/langchain) · [vercel](https://github.com/CellarDoorExits/vercel-ai-sdk) · [eliza](https://github.com/CellarDoorExits/eliza-exit) · [eas](https://github.com/CellarDoorExits/eas-adapter) · [erc-8004](https://github.com/CellarDoorExits/erc-8004-adapter) · [sign](https://github.com/CellarDoorExits/sign-protocol-adapter) · [python](https://github.com/CellarDoorExits/exit-python)

> **⚠️ Pre-release software — no formal security audit has been conducted.** Report vulnerabilities to hawthornhollows@gmail.com.

EXIT Protocol plugin for [ElizaOS](https://elizaos.ai). Gives your Eliza agent the ability to create and verify cryptographic departure records.

## Install

```bash
npm install @cellar-door/eliza
```

## Usage

```typescript
import { exitPlugin } from "@cellar-door/eliza";

// Register with your Eliza agent
const character = {
  // ...
  plugins: [exitPlugin],
};
```

## What It Does

| Action | Trigger | Description |
|--------|---------|-------------|
| `CREATE_EXIT_MARKER` | "Create an EXIT marker", "Record my departure" | Creates a signed departure record |
| `VERIFY_EXIT_MARKER` | "Verify this EXIT marker", "Check this departure" | Verifies a marker's cryptographic signature |

### Provider

- **exitHistoryProvider** — Injects recent EXIT markers into the agent's context so it can reference past departures.

## Example Conversation

```
User: Create an EXIT marker for leaving Twitter
Agent: EXIT marker created successfully.
       Marker ID: urn:exit:a1b2c3...
       Subject: did:key:z6Mk...
       Origin: Twitter

User: Verify this EXIT marker: {"@context":"https://exit.pub/v1"...}
Agent: ✅ EXIT marker verified successfully.
```

## Persistent Identity

By default, `quickExit()` generates an ephemeral keypair per marker. For agents that need a consistent identity across departures, use the lower-level API from `cellar-door-exit`:

```typescript
import { generateKeyPair, createMarker, signMarker } from "cellar-door-exit";

// Generate once, store securely
const identity = await generateKeyPair("ed25519");
// Use the same identity for all markers
const marker = createMarker({ origin: "twitter", subject: identity.did });
const signed = await signMarker(marker, identity);
```

## Privacy & GDPR

EXIT markers contain DIDs and timestamps that may constitute personal data under GDPR. See the [GDPR Guide](https://github.com/CellarDoorExits/exit-door/blob/main/GDPR_GUIDE.md) for erasure tiers and compliance guidance.

## Ecosystem

| Package | Language | Description |
|---------|----------|-------------|
| [cellar-door-exit](https://github.com/CellarDoorExits/exit-door) | TypeScript | Core protocol (reference impl) |
| [cellar-door-exit](https://github.com/CellarDoorExits/exit-python) | Python | Core protocol |
| [cellar-door-entry](https://github.com/CellarDoorExits/entry-door) | TypeScript | Arrival/entry markers |
| [@cellar-door/langchain](https://github.com/CellarDoorExits/langchain) | TypeScript | LangChain integration |
| [cellar-door-langchain](https://github.com/CellarDoorExits/cellar-door-langchain-python) | Python | LangChain integration |
| [@cellar-door/vercel-ai-sdk](https://github.com/CellarDoorExits/vercel-ai-sdk) | TypeScript | Vercel AI SDK |
| [@cellar-door/mcp-server](https://github.com/CellarDoorExits/mcp-server) | TypeScript | MCP server |
| **[@cellar-door/eliza](https://github.com/CellarDoorExits/eliza-exit)** | **TypeScript** | **ElizaOS plugin ← you are here** |
| [@cellar-door/eas](https://github.com/CellarDoorExits/eas-adapter) | TypeScript | EAS attestation anchoring |
| [@cellar-door/erc-8004](https://github.com/CellarDoorExits/erc-8004-adapter) | TypeScript | ERC-8004 identity/reputation |
| [@cellar-door/sign-protocol](https://github.com/CellarDoorExits/sign-protocol-adapter) | TypeScript | Sign Protocol attestation |

**[Paper](https://cellar-door.dev/paper/) · [Website](https://cellar-door.dev)**

## License

Apache-2.0
