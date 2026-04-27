import { readConfig } from "../config";
import {
  createFeedFollow,
  getFeedFollowsForUser,
} from "../lib/db/queries/feed_follows";
import { getFeedByUrl } from "../lib/db/queries/feeds";
import { getUserByName, User } from "../lib/db/queries/users";

export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const url = args[0];
  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error(`Feed ${url} not found`);
  }

  const feedFollow = await createFeedFollow(user.id, feed.id);

  console.log(
    `${feedFollow.userName} is successfully following ${feedFollow.feedName}`,
  );
}

export async function handlerFollowing(_: string, user: User): Promise<void> {
  const feedFollows = await getFeedFollowsForUser(user.id);
  if (!feedFollows) {
    throw new Error(`${user.name} does not follow any feeds`);
  }

  let followsList = `${user.name}'s follows:\n`;
  for (const follow of feedFollows) {
    followsList += `* ${follow.feedName}\n`;
  }

  console.log(followsList);
}
