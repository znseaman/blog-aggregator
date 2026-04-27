import type { CommandHandler, UserCommandHandler } from "./commands/commands";
import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";

export type middlewareLoggedIn = (
  handler: UserCommandHandler,
) => CommandHandler;

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async function (cmdName: string, ...args: string[]) {
    const { currentUserName } = readConfig();
    if (!currentUserName) {
      throw new Error("user not logged in");
    }

    const user = await getUserByName(currentUserName);
    if (!user) {
      throw new Error(`User ${currentUserName} not found`);
    }

    await handler(cmdName, user, ...args);
  };
}
