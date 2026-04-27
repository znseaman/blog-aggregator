import { readConfig, setUser } from "../config";
import {
  createUser,
  deleteUsers,
  getUserByName,
  getUsers,
  User,
} from "../lib/db/queries/users";

export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const existingUser = await getUserByName(userName);
  if (!existingUser) {
    throw new Error(`User ${userName} not found`);
  }

  setUser(userName);
  console.log("User switched successfully!");
}

export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const user = await createUser(userName);
  if (!user) {
    throw new Error(`User ${userName} not found`);
  }

  setUser(userName);
  console.log("User created successfully!");
}

export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await deleteUsers();

  console.log("Users deleted successfully!");
}

export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const users = await getUsers();

  const { currentUserName } = readConfig();

  let usersList = "";
  for (let user of users) {
    let isCurrent = currentUserName == user.name ? " (current)" : "";
    usersList += `* ${user.name}${isCurrent}\n`;
  }

  console.log(usersList);
}
