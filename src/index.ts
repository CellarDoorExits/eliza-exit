import type { Plugin } from "@elizaos/core";
import { exitAction } from "./actions/exit.js";
import { verifyExitAction } from "./actions/verify.js";
import { admitExitAction } from "./actions/admit.js";
import { counterSignExitAction } from "./actions/countersign.js";
import { exitHistoryProvider } from "./providers/history.js";

export const exitPlugin: Plugin = {
  name: "exit-protocol",
  description: "EXIT Protocol — departure and arrival records for AI agents",
  actions: [exitAction, verifyExitAction, admitExitAction, counterSignExitAction],
  providers: [exitHistoryProvider],
};

export { exitAction, verifyExitAction, admitExitAction, counterSignExitAction, exitHistoryProvider };
export default exitPlugin;
