import type { Plugin } from "@elizaos/core";
import { exitAction } from "./actions/exit.js";
import { verifyExitAction } from "./actions/verify.js";
import { exitHistoryProvider } from "./providers/history.js";

export const exitPlugin: Plugin = {
  name: "exit-protocol",
  description: "EXIT Protocol — departure records for AI agents",
  actions: [exitAction, verifyExitAction],
  providers: [exitHistoryProvider],
  services: [],
};

export { exitAction, verifyExitAction, exitHistoryProvider };
export default exitPlugin;
