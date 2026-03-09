# @cellar-door/eliza 𓉸

[![npm](https://img.shields.io/npm/v/@cellar-door/eliza)](https://www.npmjs.com/package/@cellar-door/eliza)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE)

> **⚠️ Pre-release software — no formal security audit has been conducted.**

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

## Ecosystem

| Package | Description |
|---------|-------------|
| [`cellar-door-exit`](https://www.npmjs.com/package/cellar-door-exit) | TypeScript core library |
| [`cellar-door-exit` (PyPI)](https://pypi.org/project/cellar-door-exit/) | Python core library |
| [`@cellar-door/eliza`](https://www.npmjs.com/package/@cellar-door/eliza) | **ElizaOS plugin** ← you are here |
| [`@cellar-door/langchain`](https://www.npmjs.com/package/@cellar-door/langchain) | LangChain integration |

## License

Apache-2.0
